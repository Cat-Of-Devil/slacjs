/*
global bluetoothle
 */

class BLE {

	constructor(updateRate = 100) {

		this.updateRate = updateRate;
		this.restartTimer = undefined;
		this.listenening = false;
		this.callback = undefined;
	}

	/**
	 * Start the radio
	 * @return {Boolean} True on success
	 */
	initRadio() {

		bluetoothle.initialize(
			(result) => {

				if (result.status == 'enabled' || result.status == 'initialized') {
					console.log('[SLACjs] Radio initialized');
				}
			},

			() => this._onError('Bluetooth is not turned on, or could not be turned on. Make sure your phone has a Bluetooth 4.+ (BLE) chip.'),
			{request: true}
		);

		//@todo Find better way to determine whether the radio is ready
		return true;
	}

	/**
	 * Start the BLE radio
	 * @return {void}
	 */
	startListening() {

		this._startScan();

		this.restartTimer = setInterval(() => {

			if (this.listening) {
				this.stopListening();
				this._startScan();

			}
		}, this.updateRate);
	}

	/**
	 * Stop listening
	 * @return {Boolean} True on success
	 */
	stopListening() {
		let success = false;

		bluetoothle.stopScan(
			(result) => {
				if (result.status == 'scanStopped') {
					success = true;
				}
			},

			(error)	=> this._onError(error)
		);

		this.listening = false;

		return success;
	}

	/**
	 * Register a function to run on each observation
	 * @param  {Function} callback
	 * @return {void}
	 */
	onObservation(callback) {
		this.callback = callback;
	}

	/**
	 * Start scanning for BLE devices
	 * @return {void}
	 */
	_startScan() {

		bluetoothle.startScan(
			(data) => this._processObservation(data),
			(error)	=> this._onError(error)
		);

		this.listening = true;
	}

	/**
	 * Run the callback for each observation
	 * @param  {object} data
	 * @return {void}
	 */
	_processObservation(data) {

		if (this.callback !== undefined && data.status == 'scanResult') {
			this.callback(data);
		}
	}

	/**
	 * Process an error message
	 * @param  {Object} error
	 * @return {void}
	 */
	_onError(error) {

		let errorMsg;

		if (error.code !== undefined) {
			errorMsg = error.code;
		}
		else {
			errorMsg = error;
		}

		console.error('Error occured: ' + errorMsg);

		navigator.notification.alert(
			'An error occured in the BLE radio: ' + errorMsg,
			undefined,
			'Error BLE',
			'Ok');
	}
}

export default BLE;