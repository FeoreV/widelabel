"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const index_js_1 = require("./index.js");
(0, node_test_1.default)("config has default env", () => {
    node_assert_1.default.ok(index_js_1.config.env);
});
