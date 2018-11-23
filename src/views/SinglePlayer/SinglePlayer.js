'use strict';

import BaseView from '../BaseView/BaseView.js';
import tagParser from '../../modules/TagParser/TagParser.js';
import SinglePlayerHandler from '../../game/SinglePlayer/SinglePlayerHandler.js';
import eventBus from '../../modules/EventBus/EventBus.js';
import router from '../../modules/Router/Router.js';
import URLS from '../../modules/Consts/Consts.js';
import GameResults from '../../components/GameResults/GameResults.js';
import './SinglePlayer.scss';

const SINGLE_PLAYER_GAME_FIELD = 'singleplayer-block__game-field';

export default class SinglePlayer extends BaseView {
	constructor() {
		super();
		this._needAuth = true;
	}

	build() {
		return new Promise((resolve) => {
			this.template = `<GameBlock {{class=${SINGLE_PLAYER_GAME_FIELD}}}>
							 <GameStat>`;
			tagParser.toHTML(this.template).then((elementsArray) => {
				this._resultBlock = new GameResults();
				this.elementsArray = elementsArray;
				const div = document.createElement('div');
				div.setAttribute('class', 'main-content__singleplayer-block');
				this.elementsArray.forEach((el) => {
					div.appendChild(el.render());
				});
				this.element = div;
				this.gameStat = this.elementsArray[1];
				this.scoreHandler = this.redrawScore.bind(this);
				this.timerHandler = this.redrawTimer.bind(this);
				this.resultsHandler = this.showResults.bind(this);
				resolve();
			});
		});
	}

	afterRender() {
		return new Promise((resolve) => {
			this.scoreLabel = document.getElementsByClassName('game-stat__score-block')[0];
			this.timerLabel = document.getElementsByClassName('game-stat__timer-block')[0];
			this._resultBlock.build({}).then(() => {
				this._resultBlock.backButton.addEventListener('click', () => {
					router.goMenu();
				});
				this._resultBlock.againButton.addEventListener('click', () => {
					this.play();
				});
				this._resultBlock.hide();
				this.element.appendChild(this._resultBlock.render());
			});
			resolve();
		});
	}

	redrawScore(value) {
		this.scoreLabel.innerText = `Score: ${value}`;
	}

	play() {
		document.body.style.cursor = 'none';
		eventBus.on('scoreRedraw', this.scoreHandler);
		eventBus.on('timerTick', this.timerHandler);
		eventBus.on('timerStop', this.resultsHandler);
		this._resultBlock.hide();
		this.gameStat.show();
		this.scoreLabel.innerText = 'Score: 0';
		this.timerLabel.innerText = 'Seconds Left: 60';
		this._gameHandler = new SinglePlayerHandler([], SINGLE_PLAYER_GAME_FIELD);
		this._gameHandler.startGame();
	}

	showResults() {
		this._resultBlock.show();
		this.endGame();
	}

	endGame() {
		document.body.style.cursor = 'default';
		this._resultBlock.scoreLabel.innerHTML = `Your score is ${this._gameHandler.getScore()}`;
		this._resultBlock.goalsLabel.innerHTML = `Goals passed: ${this._gameHandler.getGoalsPassed()}`;
		this.gameStat.hide();
		this._gameHandler.stopGame();
		eventBus.off('timerStop', this.resultsHandler);
		eventBus.off('timerTick', this.timerHandler);
		eventBus.off('scoreRedraw', this.scoreHandler);
		this._gameHandler.stopGame();
	}

	redrawTimer(value) {
		this.timerLabel.innerText = `Seconds Left: ${value}`;
	}

	show() {
		super.show().then(() => {
			this.element.style.display = 'grid';
			this.mainLogo.style.display = 'none';
			this.play();
		});
	}

	hide() {
		super.hide();
		this.endGame();
		this._resultBlock.hide();
	}
}
