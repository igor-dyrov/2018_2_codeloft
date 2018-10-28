'use strict';

import eventBus from '../../modules/EventBus/EventBus.js';
import userService from '../../services/UserService/UserService.js';
import router from '../../modules/Router/Router.js';
import URLS from '../../modules/Consts/Consts.js';

const MAIN_ELEMENT = 'main';

export default class BaseView {

    constructor() {
        this.element = null;
        this.elementsArray = [];
        this._needAuth = false;
        eventBus.on('enterPressed', this.mainEvent.bind(this));
        eventBus.on('loggedIn', this.handlePrivateComponents.bind(this));
        eventBus.on('loggedOut', this.handlePrivateComponents.bind(this));
    }

    init() {
        return new Promise((resolve) => {
            this.build().then(() => {
                this.hide();
                document.getElementById(MAIN_ELEMENT).appendChild(this.render());
                resolve();
            });
        });
    }

    mainEvent() {

    }

    build() {

    }

    render() {
        return this.element;
    }

    preRender() {
        return new Promise((resolve) => resolve());
    }

    afterRender() {
        return new Promise((resolve) => resolve());
    }

    show() {
        this.preRender()
            .then(() => { if (!this.element) return this.init() })
            .then(() => {
                if (!this.needAuth() || userService.isLogIn()) {
                    this.afterRender().then(() => this.element.style.display = 'block')
                } else {
                    router.go(URLS.SIGN_IN);
                }
            });
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    handlePrivateComponents() {
        if (this.element) {
            this.elementsArray.forEach((element) => element.handleVisibility());
        }
    }

    needAuth() {
        return this._needAuth;
    }
}