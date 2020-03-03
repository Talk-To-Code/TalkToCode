import sys

import socket

from Crypto import Random

from Crypto.Cipher import AES

import base64

import serial

import threading

import time

import queue

import pandas as pd, numpy as np

from sklearn.externals import joblib

import pickle

from scipy import stats

mlp_model = joblib.load("ML_Models/mlp_10move_updated.pkl")

windowSize = 54

X_columns = ["accLH_x", "accLH_y", "accLH_z", "gyrLH_x", "gyrLH_y", "gyrLH_z", "accRH_x", "accRH_y", "accRH_z", "gyrRH_x", "gyrRH_y", "gyrRH_z", "accRL_x", "accRL_y", "accRL_z"]

feature_columns = ["accLH_x_mean", "accLH_y_mean", "accLH_z_mean", "gyrLH_x_mean", "gyrLH_y_mean", "gyrLH_z_mean", "accRH_x_mean", "accRH_y_mean", "accRH_z_mean", "gyrRH_x_mean", "gyrRH_y_mean", "gyrRH_z_mean", "accRL_x_mean", "accRL_y_mean", "accRL_z_mean"]

data_packet_list = []

class Client(threading.Thread):
	def __init__(self, serverName, serverPort, dataQueue, volCurPowQueue):
		threading.Thread.__init__(self)

		self.shutdown = threading.Event()

		self.clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

		self.clientSocket.connect((serverName, serverPort))

		self.predictionReady = False

		self.predictedAction = ""

		self.dataQueue = dataQueue

		self.volCurPowQueue = volCurPowQueue

		self.moveCounter = 0

	def run(self):
		prediction = []

		while (not self.shutdown.is_set()):
			#to remove; timing check
			if(self.dataQueue.empty()):
				queue_start_time = time.time()

			if(self.dataQueue.full()):
				print("---Queue took %s seconds to fill ---" % (time.time() - queue_start_time))

				print("------------------")

				prediction.append(self.predictAction())

				self.setPredictionReady(prediction)

				if(self.predictionReady):
					prediction.clear()

					if(self.predictedAction != "neutral"):
						if(self.predictedAction == "endmove"):
							if(self.moveCounter > 38):
								self.predictedAction = "logout"

							else:
								continue

						else:
							self.moveCounter += 1

						volCurPow = self.volCurPowQueue.get()

						data = [self.predictedAction, volCurPow[0], volCurPow[1], volCurPow[2], volCurPow[3]]

						self.sendData(data)

						print("Dance Move is: " + str(self.predictedAction) + "\n")

	def stop(self):
		self.clientSocket.close()

		self.shutdown.set()

	def sendData(self, data):
		iv = Random.get_random_bytes(16)

		message = "#"

		for i in range(4):
			message += str(data[i]) + "|"

		message += str(data[4])

		secret_key = bytes("1234567890abcdef", "utf-8")

		aesCipher = AES.new(secret_key, AES.MODE_CBC, iv)

		padding = AES.block_size - (len(message) % AES.block_size)

		if(padding == AES.block_size):
			padding = 0

		for i in range(padding):
			message += " "

		encryptedMsg = iv + aesCipher.encrypt(message)

		b64CipherMsg = base64.b64encode(encryptedMsg)

		try:
			self.clientSocket.sendall(b64CipherMsg)

		except:
			print("Request timed out")

		else:
			print("Request didn't time out")

		finally:
			print("FINALLY!")

		if(self.predictedAction == "logout"):
			self.stop()

	def predictAction(self):
		predict_start_time = time.time()

		data_packet_list.clear()

		for i in range(100):
			data_points = self.dataQueue.get()

			data_packet_list.append(data_points)

		data_df = pd.DataFrame(data_packet_list, columns=X_columns)

		feature_df = pd.DataFrame(columns=feature_columns)

		feature_df["accLH_x_mean"] = data_df["accLH_x"].rolling(window=windowSize).mean()

		feature_df["accLH_y_mean"] = data_df["accLH_y"].rolling(window=windowSize).mean()

		feature_df["accLH_z_mean"] = data_df["accLH_z"].rolling(window=windowSize).mean()

		feature_df["gyrLH_x_mean"] = data_df["gyrLH_x"].rolling(window=windowSize).mean()

		feature_df["gyrLH_y_mean"] = data_df["gyrLH_y"].rolling(window=windowSize).mean()

		feature_df["gyrLH_z_mean"] = data_df["gyrLH_z"].rolling(window=windowSize).mean()

		feature_df["accRH_x_mean"] = data_df["accRH_x"].rolling(window=windowSize).mean()

		feature_df["accRH_y_mean"] = data_df["accRH_y"].rolling(window=windowSize).mean()

		feature_df["accRH_z_mean"] = data_df["accRH_z"].rolling(window=windowSize).mean()

		feature_df["gyrRH_x_mean"] = data_df["gyrRH_x"].rolling(window=windowSize).mean()

		feature_df["gyrRH_y_mean"] = data_df["gyrRH_y"].rolling(window=windowSize).mean()

		feature_df["gyrRH_z_mean"] = data_df["gyrRH_z"].rolling(window=windowSize).mean()

		feature_df["accRL_x_mean"] = data_df["accRL_x"].rolling(window=windowSize).mean()

		feature_df["accRL_y_mean"] = data_df["accRL_y"].rolling(window=windowSize).mean()

		feature_df["accRL_z_mean"] = data_df["accRL_z"].rolling(window=windowSize).mean()

		feature_df.dropna(inplace=True)

		prediction = mlp_model.predict(feature_df)

		#For immediate prediction
		prediction_list = list(prediction)

		final_prediction = max(set(prediction_list), key=prediction_list.count)

		print("Initial prediction is: " + str(final_prediction))

		print("---Prediction took %s seconds ---" % (time.time() - predict_start_time))

		print("------------------")

		#return prediction
		return final_prediction

	def setPredictionReady(self, prediction):
		set_pre_start_time = time.time()

		predictionReady = False

		mode, count = "neutral", 0

		if(len(prediction) >= 3):
			mode = max(set(prediction), key=prediction.count)

			print("Prediction Ready!")

			print("Prediction List is: " + str(prediction))

			predictionReady = True

			#for prediction after many counts
			#combined_arr = np.concatenate(prediction, axis=0)

			#mode_res = stats.mode(combined_arr)

			#count = mode_res[1]

			'''
			if(count > 50):
				print("Prediction Ready!")

				mode = mode_res[0]

				predictionReady = True

			'''

		else:
			print("Prediction Not Ready.")

		self.predictedAction = mode

		self.predictionReady = predictionReady

		print("---Setting prediction ready took %s seconds ---" % (time.time() - set_pre_start_time))

		print("------------------")


class Serial(threading.Thread):
	def __init__(self, clientThread, dataQueue, volCurPowQueue):
		threading.Thread.__init__(self)

		self.shutdown = threading.Event()

		self.isHandShakeDone = False

		self.port = serial.Serial("/dev/ttyAMA0", baudrate=115200, timeout=1.0)

		self.dataQueue = dataQueue

		self.volCurPowQueue = volCurPowQueue

		self.clientThread = clientThread

		self.cumPower = 0

	def run(self):
		while (not self.isHandShakeDone):
			self.port.write(bytes("H", "utf-8"))

			ack = self.port.read().decode()

			if(ack == 'A'):
				self.isHandShakeDone = True

				self.port.write(bytes("A", "utf-8"))

		else:
			print("Handshake Done!\n")

		while (not self.shutdown.is_set()):
			self.getData()

			if(self.clientThread.predictionReady):
				with self.dataQueue.mutex:
					self.dataQueue.queue.clear()

				self.clientThread.predictionReady = False

			if(self.clientThread.shutdown.is_set()):
				self.stop()

	def stop(self):
		self.shutdown.set()

	def getData(self):
		length = ""

		while (length == ""):
			length = self.port.read().decode("utf-8")

		length += self.port.read().decode("utf-8")

		length += self.port.read().decode("utf-8")

		data = ""

		checksum = ord('\0')

		for i in range(int(length)):
			dataByte = self.port.read().decode("utf-8")

			if(dataByte != ','):
				checksum ^= ord(dataByte)

			data += dataByte

			if(i == int(length)):
				break

		else:
			print("Checksum initialised!\n")

		if(checksum == ord(self.port.read().decode("utf-8"))):
			self.port.write(bytes("A", "utf-8"))

			self.deserialize(data)

		else:
			self.port.write(bytes("N", "utf-8"))

			self.getData()

	def deserialize(self, data):
		if(data.split(',')[0] == 'D'):
			deserializedData = []

			for i in range(len(data.split(',')) - 1):
				deserializedData.append(float(data.split(',')[i + 1]))

			if(self.dataQueue.full()):
				self.dataQueue.get()

			self.dataQueue.put(deserializedData)

		else:
			self.setVolCurPowQueue(round(float(data.split(',')[1]), 1), round(float(data.split(',')[2]), 1))

			self.getData()

	def setVolCurPowQueue(self, sensorValue, vdValue):
		sensorValue = (sensorValue * 5) / 1023

		vdValue = (vdValue * 5) / 1023

		voltage = round(vdValue * 2, 4)

		current = round(((sensorValue / (10 * 0.1)) / 10), 4)

		power = round(voltage * current, 4)

		self.cumPower += power * 5

		self.cumPower = round(self.cumPower, 4)

		volCurPow = [voltage, current, power, self.cumPower]

		if(not self.volCurPowQueue.empty()):
			with self.volCurPowQueue.mutex as m:
				self.volCurPowQueue.queue.clear()

		self.volCurPowQueue.put(volCurPow)


if(__name__ == "__main__"):
	if(len(sys.argv) != 3):
		print("Invalid number of arguments")

		print("python client.py [IP address] [Port]")

		sys.exit()

	s = {[1, 3], {3.3, 4.45}, ("hi", "bye"), {"melon" : 5, "tomato" : 10}}

	t = (1, 'e', "ea", 3.3, True, False)

	x = lambda a, b : a - b

	print(s)

	print(t)

	print(x(1))

	serverName = sys.argv[1]

	serverPort = int(sys.argv[2])

	dataQueue = queue.Queue(maxsize=100)

	volCurPowQueue = queue.Queue()

	myClient = Client(serverName, serverPort, dataQueue, volCurPowQueue)

	mySerial = Serial(myClient, dataQueue, volCurPowQueue)

	myClient.start()

	mySerial.start()


