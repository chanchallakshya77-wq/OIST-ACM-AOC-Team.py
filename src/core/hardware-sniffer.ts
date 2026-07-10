// ============================================================
// Hardware Capability Sniffer
// Rectification #1: Probe RAM + WebGPU, decide local vs TEE
// ============================================================

import type { HardwareCapabilityReport } from "./state-token";

/**
 * Runs a hardware capability check on boot.
 * Determines whether the device can run local LLMs or needs TEE fallback.
 *
 * Decision logic:
 * - RAM < 4 GB → TEE fallback (OOM risk)
 * - No WebGPU → TEE fallback (no GPU acceleration)
 * - WebGPU available but unstable (fails smoke test) → TEE fallback
 * - RAM >= 4 GB + stable WebGPU → local execution OK
 */
export async function sniffHardware(): Promise<HardwareCapabilityReport> {
  const ram = getDeviceMemory();
  const gpu = await probeWebGPU();

  const canRunLocalLLM =
    ram !== null &&
    ram >= 4 &&
    gpu.available &&
    gpu.stable;

  return {
    ramGB: ram,
    webGPUAvailable: gpu.available,
    webGPUStable: gpu.stable,
    canRunLocalLLM,
    fallbackTarget: canRunLocalLLM ? "local" : "tee",
    sniffedAt: Date.now(),
  };
}

/**
 * Read device memory via Navigator API.
 * Returns null if the API is not available (Firefox, older browsers).
 * Note: Browsers may quantize this value (0.25, 0.5, 1, 2, 4, 8).
 */
function getDeviceMemory(): number | null {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return nav.deviceMemory ?? null;
}

interface WebGPUProbeResult {
  available: boolean;
  stable: boolean;
  adapterInfo?: string;
  error?: string;
}

/**
 * Probe WebGPU availability and stability.
 * Runs a small matrix multiplication smoke test to detect flaky drivers.
 */
async function probeWebGPU(): Promise<WebGPUProbeResult> {
  if (!("gpu" in navigator)) {
    return { available: false, stable: false, error: "WebGPU API not present" };
  }

  try {
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return { available: false, stable: false, error: "No adapter returned" };
    }

    const device = await adapter.requestDevice();

    // Smoke test: small 64×64 matrix multiply to verify driver stability
    const stable = await runMatMulSmokeTest(device);

    const adapterInfo = `${adapter.info?.vendor ?? "unknown"} / ${adapter.info?.architecture ?? "unknown"}`;

    device.destroy();

    return { available: true, stable, adapterInfo };
  } catch (err) {
    return {
      available: true,
      stable: false,
      error: `WebGPU probe failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Run a minimal compute shader to verify the GPU driver works correctly.
 * A 64×64 matmul is small enough to complete in <100ms on any GPU.
 */
async function runMatMulSmokeTest(device: any): Promise<boolean> {
  try {
    const SIZE = 64;
    const BUFFER_SIZE = SIZE * SIZE * 4; // float32

    // Create input buffers with test data
    const inputA = new Float32Array(SIZE * SIZE).fill(1.0);
    const inputB = new Float32Array(SIZE * SIZE).fill(1.0);

    const bufferA = device.createBuffer({
      size: BUFFER_SIZE,
      usage: 0x00000008 | 0x00000004, // STORAGE | COPY_DST
    });
    const bufferB = device.createBuffer({
      size: BUFFER_SIZE,
      usage: 0x00000008 | 0x00000004,
    });
    const bufferOut = device.createBuffer({
      size: BUFFER_SIZE,
      usage: 0x00000008 | 0x00000010, // STORAGE | COPY_SRC
    });
    const readBuffer = device.createBuffer({
      size: BUFFER_SIZE,
      usage: 0x00000001 | 0x00000004, // MAP_READ | COPY_DST
    });

    device.queue.writeBuffer(bufferA, 0, inputA);
    device.queue.writeBuffer(bufferB, 0, inputB);

    const shaderModule = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read> a: array<f32>;
        @group(0) @binding(1) var<storage, read> b: array<f32>;
        @group(0) @binding(2) var<storage, read_write> result: array<f32>;

        @compute @workgroup_size(8, 8)
        fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
          let row = gid.x;
          let col = gid.y;
          if (row >= ${SIZE}u || col >= ${SIZE}u) { return; }
          var sum: f32 = 0.0;
          for (var k: u32 = 0u; k < ${SIZE}u; k = k + 1u) {
            sum = sum + a[row * ${SIZE}u + k] * b[k * ${SIZE}u + col];
          }
          result[row * ${SIZE}u + col] = sum;
        }
      `,
    });

    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module: shaderModule, entryPoint: "main" },
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: bufferA } },
        { binding: 1, resource: { buffer: bufferB } },
        { binding: 2, resource: { buffer: bufferOut } },
      ],
    });

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(SIZE / 8), Math.ceil(SIZE / 8));
    pass.end();

    encoder.copyBufferToBuffer(bufferOut, 0, readBuffer, 0, BUFFER_SIZE);
    device.queue.submit([encoder.finish()]);

    await readBuffer.mapAsync(1); // MAP_READ = 1
    const result = new Float32Array(readBuffer.getMappedRange());

    // Verify: each element should be SIZE (64.0) since we multiplied
    // a row of 1s by a column of 1s → sum of 64 ones = 64
    const firstVal = result[0] ?? 0;
    readBuffer.unmap();

    // Clean up
    bufferA.destroy();
    bufferB.destroy();
    bufferOut.destroy();
    readBuffer.destroy();

    // Allow small floating-point tolerance
    return Math.abs(firstVal - SIZE) < 0.01;
  } catch {
    return false;
  }
}

export type { WebGPUProbeResult };
