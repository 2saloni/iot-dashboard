"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const singleton_decorator_1 = require("../decorators/singleton.decorator");
const device_entity_1 = require("../entities/device.entity");
const config_1 = require("../config");
let MqttService = class MqttService {
    constructor() {
        this.mqttClient = null;
        this.deviceRepository = config_1.AppDataSource.getRepository(device_entity_1.Device);
    }
    async mqttData() {
        await this.connectToMqtt();
    }
    async connectToMqtt() {
        try {
            const url = process.env.MQTT_BROKER_URL;
            if (!url)
                throw new Error("MQTT_BROKER_URL is not set");
            // connect via module, store on the instance
            this.mqttClient = mqtt_1.default.connect(url, {
                username: process.env.MQTT_USERNAME || undefined,
                password: process.env.MQTT_PASSWORD || undefined,
                clientId: `ingestor_${Math.random().toString(16).slice(2, 10)}`,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 1500,
            });
            // build topics
            const topics = await this.buildTopic();
            this.mqttClient.on('message', (topic, message) => {
                this.topicData(topic, message);
            });
            this.mqttClient.on('connect', () => {
                if (topics.length === 0) {
                    console.log('No topics found');
                }
                this.mqttClient.subscribe(topics, (err) => {
                    if (!err) {
                        console.log("📡 Subscribed to topic:", topics);
                    }
                });
                // this.mqttClient!.on('message', (topic, message) => {
                //   this.topicData(topic, message);
                // });
            });
        }
        catch (error) {
            console.error('Error connecting to MQTT broker', error);
        }
    }
    async buildTopic() {
        try {
            //Get all devices with their zones
            const devices = await this.deviceRepository.find({
                relations: ['zones'],
            });
            const topics = [];
            for (const device of devices) {
                // Subscribe to device-specific topics
                if (device.zones && device.zones.length > 0) {
                    for (const zone of device.zones) {
                        // Format: 00001Zone1 - deviceId followed by zoneName
                        topics.push(`${device.deviceId}${zone.name}`);
                    }
                }
            }
            return topics;
        }
        catch (error) {
            console.error('Error building topic', error);
            return [];
        }
    }
    async topicData(topic, message) {
        try {
            // Parse topic: 5 digits for deviceId + optional zone name
            const deviceTopic = topic.match(/^(\d{5})([A-Za-z][\w-]*)?$/);
            if (!deviceTopic) {
                // Ignore topics that don't match our convention
                return;
            }
            const deviceIdStr = deviceTopic[1]; // "00001"
            const zoneName = deviceTopic[2]; // "Zone1" | undefined
            // Parse payload (JSON preferred; fallback to raw string)
            let data;
            try {
                data = JSON.parse(message.toString());
            }
            catch {
                data = { raw: message.toString() };
            }
            // Load the device
            const device = await this.deviceRepository.findOne({
                where: { deviceId: deviceIdStr },
                relations: ["zones"],
            });
            if (!device) {
                console.log(`Device not found for id ${deviceIdStr} (topic: ${topic})`);
                return;
            }
            // Merge into metadata
            device.metadata = device.metadata ?? {};
            const now = new Date();
            if (zoneName) {
                device.metadata[zoneName] = {
                    ...(device.metadata[zoneName] ?? {}),
                    ...data,
                    lastUpdated: now,
                };
            }
            else {
                device.metadata = {
                    ...device.metadata,
                    ...data,
                    lastUpdated: now,
                };
            }
            await this.deviceRepository.save(device);
        }
        catch (error) {
            console.error("Error processing topic data", error);
        }
    }
};
exports.MqttService = MqttService;
exports.MqttService = MqttService = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], MqttService);
