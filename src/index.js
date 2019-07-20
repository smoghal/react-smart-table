import React from 'react';
import ReactDOM from 'react-dom';

// TODO - check ENV and load appropriate config_* appropriately
import App from './components/app';
import AppHeader from './components/header/header';

ReactDOM.render(
  <div>
    <AppHeader />
    <App />
  </div>
  , document.querySelector('.app-container'));
