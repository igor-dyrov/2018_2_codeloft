'use strict';

import MainComponent from '../MainComponent/MainComponent.js';
import eventHandler from '../../modules/EventHandler/EventHandler.js';

export default class Button extends MainComponent {
	constructor() {
		super();
		this.template = '<div class = "{{class}}"><span>{{text}}</span></div>';
		this.events = ['click'];
	}
	addEvents(config) {
		this.events.forEach(event => {
			eventHandler.handleEvent(this.element.children[0], event, config[event]);
		});
	}
}
