class ReplayRenderer {

    constructor(element, xMax = 15, yMax = 15, startX = 2.5, startY = 5) {
        this.element = element;
        this.canvas = document.getElementById(element);
        this.ctx = this.canvas.getContext('2d');

        this.xMax = xMax;
        this.yMax = yMax;
        this.startX = startX;
        this.startY = startY;

        this._resizeCanvas();
        this.scaleFactor = this._calculateScaleFactor();
    }

    render(particleSet) {
        this.clearCanvas();

		const best = particleSet.bestParticle();

		particleSet.particles().forEach((p) => {

			if (p === best) {
				return;
			}

			this._plotUserTrace(p.user, '#A8A8A8', 2);
		});

		//Plot any landmark init filters
		let color = 50;

		particleSet.landmarkInitSet.particleSetMap.forEach((landmarkPf) => {
			landmarkPf.particles.forEach((p) => {
				this._plotObject(p, 'rgb(0,' + color + ',0)', 5);
			});

            color += 50;
		});

		//Plot the best user trace
		this._plotUserTrace(best.user, '#24780D');

        //Plot the average landmark positions
		particleSet.landmarkEstimate().forEach((landmark) => {
			this._plotObject(landmark, '#71BBF0', 10);
		});

        //Plot the landmarks of the best particle
        best.landmarks.forEach((landmark) => {
			this._plotObject(landmark, '#B52B2B', 10);
		});

		return this;
    }

    /**
	 * Clear the canvas
	 * @return {ReplayRenderer}
	 */
	clearCanvas() {

		//Save transformation matrix
		this.ctx.save();

		//Reset the transform to clear the whole canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		//Restore transformation
		this.ctx.restore();

		return this;
	}

    /**
	 * Resize the canvas for retina devices
	 * @return {void}
	 */
	_resizeCanvas() {

		const cs = window.getComputedStyle(this.canvas);
		const width = parseInt(cs.getPropertyValue('width'), 10);
		const height = parseInt(cs.getPropertyValue('height'), 10);

		//Calcuate a factor for the resolution
		//Use 1.99 scale on retina devices
		const resolutionFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

		//Make the canvas smaller with css
		this.canvas.width = width * resolutionFactor;
		this.canvas.height = height * resolutionFactor;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
	}

	/**
	 * Scale the canvas to zoom in
	 * @return {void}
	 */
	_calculateScaleFactor() {

		const width = this.canvas.width;
		const height = this.canvas.height;

		//Calculate maximal possible scalefactor
		const scaleXMax = width / this.xMax;
		const scaleYMax = height / this.yMax;

		return Math.min(scaleXMax, scaleYMax);
	}

    /**
	 * Plot a user object on the canvas
	 * @param  {User} user
	 * @param  {String} color
	 * @param  {float} Range of the sensor
	 * @return {void}
	 */
	_plotUserTrace(user, color = '#A8A8A8', lineWidth = 2) {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = lineWidth;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = color;

		this.ctx.beginPath();

		let resize = false;

		user.trace.values().forEach(({x, y, theta}, i) => {

			const tX = this._tx(x);
			const tY = this._ty(y);

			if (i === 0) {
				this.ctx.moveTo(tX, tY);
			}
			else {
				this.ctx.lineTo(tX, tY);
			}
		});

		this.ctx.stroke();
		this.ctx.closePath();

		return resize;
	}

    /**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	_tx(x) {
		return (x + this.startX) * this.scaleFactor;
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	_ty(y) {
		return (this.yMax - (y + this.startY)) * this.scaleFactor;
	}

	/**
	 * Plot a object
	 * @param {Object} objects A objects with at least an x,y value
	 * @param {string} fillStyle
	 */
	_plotObject(object, fillStyle = '#000000', size = 3) {
		this.ctx.fillStyle = fillStyle;

		//Compensate for landmark size
		var x = this._tx(object.x) - (0.5 * size);
		var y = this._ty(object.y) - (0.5 * size);

		this.ctx.fillRect(x, y, size, size);

		if(object.name !== undefined) {
			this.ctx.font = "15px serif";
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(object.name, x, y);
		}
	}
}

export default ReplayRenderer;
