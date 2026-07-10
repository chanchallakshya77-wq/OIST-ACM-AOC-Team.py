import { render } from 'preact';
import { App } from './ui/app.tsx';
import './ui/styles/index.css';

// Render the application
render(<App />, document.getElementById('app')!);

