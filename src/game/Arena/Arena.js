import Goal from '../Goal/Goal.js';
import eventBus from '../../modules/EventBus/EventBus.js';

const SCORE_RATE = 2;
const GOAL_RADIUS = 10;

export default class Arena {
	constructor() {
		this._gameBlock = document.getElementsByClassName('game-field')[0];
		this._context = this._gameBlock.getContext('2d');
		this._xMin = this._gameBlock.getBoundingClientRect().x;
		this._yMin = this._gameBlock.getBoundingClientRect().y;
		this._xMax = this._gameBlock.getBoundingClientRect().width - this._xMin;
		this._yMax = this._gameBlock.getBoundingClientRect().height - this._yMin;

		this._diagonal = Math.sqrt((this._xMax - this._xMin) * (this._xMax - this._xMin)
			+ (this._yMax - this._yMin) * (this._yMax - this._yMin));
		this._currentGoal = {};
		window.addEventListener('resize', this.resizeGameField.bind(this));
		this.resizeGameField();
		this.clearField();
	}

	resizeGameField() {
		this._gameBlock.width = window.innerWidth;
		this._gameBlock.height = window.innerHeight;
	}

	canMove(player) {
		if (player) {
			const deltaX1 = this._currentGoal.getCoords().x1 - (player.getX() + player.getDirection().x);
			const deltaY1 = this._currentGoal.getCoords().y1 - (player.getY() + player.getDirection().y);
			const deltaX2 = this._currentGoal.getCoords().x2 - (player.getX() + player.getDirection().x);
			const deltaY2 = this._currentGoal.getCoords().y2 - (player.getY() + player.getDirection().y);
			if (Math.sqrt(deltaX1 * deltaX1 + deltaY1 * deltaY1) < player.getRadius() + this._currentGoal.getRadius() - 1
				|| Math.sqrt(deltaX2 * deltaX2 + deltaY2 * deltaY2) < player.getRadius() + this._currentGoal.getRadius() - 1) {
				return false;
			}
			return true;
		}
		return false;
	}

	clearField() {
		this._context.beginPath();
		this._context.fillStyle = '#0C141F';
		this._context.fillRect(this._xMin, this._yMin, this._xMax, this._yMax);
		this._context.closePath();
		this._context.beginPath();
	}

	clearPlayer(player) {
		if (player) {
			this._context.globalCompositeOperation = 'destination-out';
			this._context.beginPath();
			this._context.arc(player.getX(), player.getY(), player.getRadius() + 2, 0, 2 * Math.PI);
			this._context.fillStyle = '#0C141F';
			this._context.fill();
			this._context.closePath();
		}
	}

	drawPlayer(player) {
		if (player) {
			this._context.globalCompositeOperation = 'source-over';
			this._context.beginPath();
			this._context.arc(player.getX(), player.getY(), player.getRadius(), 0, 2 * Math.PI);
			this._context.fillStyle = player.getColor();
			this._context.fill();
			this._context.closePath();
		}
	}

	_checkCollision(players, coords) {
		let collision = false;
		players.forEach((player) => {
			const deltaX1 = coords.firstX - (player.getX() + player.getDirection().x);
			const deltaY1 = coords.firstY - (player.getY() + player.getDirection().y);
			const deltaX2 = coords.secondX - (player.getX() + player.getDirection().x);
			const deltaY2 = coords.secondY - (player.getY() + player.getDirection().y);
			if (Math.sqrt(deltaX1 * deltaX1 + deltaY1 * deltaY1) < player.getRadius() + GOAL_RADIUS - 1) {
				collision = true;
			}
			if (Math.sqrt(deltaX2 * deltaX2 + deltaY2 * deltaY2) < player.getRadius() + GOAL_RADIUS - 1) {
				collision = true;
			}
		});
		return collision;
	}

	spawnGoal(players) {
		const coords = {};
		coords.firstX = Math.floor(Math.random() * (this._xMax - 300 - this._xMin + 20) + this._xMin + 20);
		coords.firstY = Math.floor(Math.random() * (this._yMax - 300 - this._yMin + 20) + this._yMin + 20);

		coords.secondX = Math.floor(Math.random() * (coords.firstX + 100 - coords.firstX + 40)) + coords.firstX + 40;
		coords.secondY = Math.floor(Math.random() * (coords.firstY + 100 - coords.firstY + 40)) + coords.firstY + 40;

		if (!this._checkCollision(players, coords)) {
			this._currentGoal = new Goal(coords.firstX, coords.firstY, coords.secondX, coords.secondY);
			this.drawGoal();
		} else {
			this.spawnGoal(players);
		}
	}

	drawGoal() {
		if (this._currentGoal) {
			this._context.globalCompositeOperation = 'source-over';
			this._context.beginPath();
			this._context.arc(this._currentGoal.getCoords().x1, this._currentGoal.getCoords().y1,
				this._currentGoal.getRadius() + 2, 0, 2 * Math.PI);
			this._context.arc(this._currentGoal.getCoords().x2, this._currentGoal.getCoords().y2,
				this._currentGoal.getRadius() + 2, 0, 2 * Math.PI);
			this._context.fillStyle = '#FFE64D';
			this._context.fill();
			this._context.closePath();

			// setInterval(this.goalAnimate, 50);

			this._context.beginPath();
			this._context.moveTo(this._currentGoal.getCoords().x1, this._currentGoal.getCoords().y1);
			this._context.lineTo(this._currentGoal.getCoords().x2, this._currentGoal.getCoords().y2);
			this._context.strokeStyle = '#FFE64D';
			this._context.lineWidth = 5;
			this._context.stroke();
			this._context.closePath();
		}
	}

	clearGoal() {
		if (this._currentGoal) {
			this._context.globalCompositeOperation = 'destination-out';
			this._context.beginPath();
			this._context.arc(this._currentGoal.getCoords().x1, this._currentGoal.getCoords().y1,
				this._currentGoal.getRadius() + 2, 0, 2 * Math.PI);
			this._context.arc(this._currentGoal.getCoords().x2, this._currentGoal.getCoords().y2,
				this._currentGoal.getRadius() + 2, 0, 2 * Math.PI);
			this._context.fillStyle = '#0C141F';
			this._context.fill();
			this._context.closePath();

			this._context.beginPath();
			this._context.moveTo(this._currentGoal.getCoords().x1, this._currentGoal.getCoords().y1);
			this._context.lineTo(this._currentGoal.getCoords().x2, this._currentGoal.getCoords().y2);
			this._context.strokeStyle = '#FFE64D';
			this._context.lineWidth = 7;
			this._context.stroke();
			this._context.closePath();
		}
	}

	goalAnimate(x, y) {
		this._context.beginPath();
		this._context.arc(x, y, 10, 0, 2 * Math.PI);
		this._context.fillStyle = '#FFE64D';
		this._context.fill();
		this._context.closePath();
	}

	checkGoalCollision(player) {
		if (this._currentGoal && player.getY() <= this._currentGoal.calculateY(player.getX()) + 5
			&& player.getY() >= this._currentGoal.calculateY(player.getX()) - 5
			&& this._currentGoal.inInterval(player.getY())) {
			eventBus.emit('goalCollision', {
				player: player,
				scoreBonus: Math.round(this._diagonal / (SCORE_RATE * this._currentGoal.getLength()))
			});
		}
	}

	checkBorderCollision(player) {
		if (player.getX() < this._xMin) {
			player.setX(this._xMax);
		}
		if (player.getY() < this._yMin) {
			player.setY(this._yMax);
		}
		if (player.getX() > this._xMax) {
			player.setX(this._xMin);
		}
		if (player.getY() > this._yMax) {
			player.setY(this._yMin);
		}
	}
}