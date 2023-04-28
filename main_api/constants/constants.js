const HOST_URL_RESET_PASSWORD =
  "http://localhost:3000/v1/student-reset-password?RESET_PASSWORD_TOKEN=";
const HOST_URL_VERIFY_USER =
  "http://localhost:3000/v1/customer-verification?VERIFY_USER_TOKEN=";
const COMPANY_NAME = "©2023, Betacode Pvt. Ltd. All Rights Reserved";
const DOMAIN_URL = "http://locahost:3000/";
const SERVER_URL = "http://localhost:9000/";
const SUPPORT_EMAIL_ID = "rahul.rohilla1081@gmail.com";
const SUPPORT_EMAIL_PASSWORD = "vzhkliuwvyfsyast";
let RESET_PASSWORD_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA10dzkAABTGElEQVR4nO3dB3wUhb7F8ZNe6b333ntvgogKAgIqoHSkd6QTeui9dwRBEbEBCtKUjoDSpRNCC5CekELa+0+8vqveKMlmZ3fK+d5PdM4m+sQn4cfs7oxDyIukJBARERGRaTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik2EAEhEREZkMA5CIiIjIZBiARERERCbDACQiIiIyGQYgERERkckwAImIiIhMhgFIREREZDIMQCIiIiKTYQASERERmQwDkIiIiMhkGIBEREREJsMAJCIiIjIZBiARERGRyTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik2EAEhEREZkMA5CIiIjIZBiARERERCbDACQiIiIyGQYgERERkckwAImIiIhMhgFIREREZDIMQCIiIiKTYQASERERmQwDkIiIiMhkGIBEREREJsMAJCIiIjIZBiARERGRyTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik2EAEhEREZkMA5CIiIjIZBiARERERCbDACQiIiIyGQYgERERkckwAImIiIhMhgFIREREZDIMQCIiIiKTYQASERERmQwDkIiIiMhkGIBERAbwNCAA4eFhckRGkTlLVmTPkUOOiKyPAUhEpHPPIyPx0YQxiPD2lkVG4R0RgaXzF8PZ2VkWkXUxAImIdC40JAQjfMYh8sM+ssgoXBctxIZV6+Di4iKLyLoYgEREOscANCYGIKmJAUhEpHMMQGNiAJKaGIBERDrHADQmBiCpiQFIRKRzDEBjYgCSmhiAREQ6xwA0JgYgqYkBSESkcwxAY2IAkpoYgEREOscANCYGIKmJAUhEpHMMQGNiAJKaGIBERDrHADQmBiCpiQFIRKRzDEBjYgCSmhiAREQ6xwA0JgYgqYkBSESkcwxAY2IAkpoYgEREOscANCYGIKmJAUhE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5Upi0KCB8ggREZE2MADJ7gwVgHExSAx8gByOMcjrloAP3u+M0mXLySeIiIi0gwFIdteu1RuIyVcJSQ4OsvTFwckJngnRcEM83N3c4PQ8GNWqV0P9uvVQtkIF+QoiIiLtYQCS3S2a44uSpcvCQYcB6OnhCTd3d2TIlAmZM2dBvgIF5FEiIiJtYwASERERmQwDkIiIiMhkGIBEREREJsMAJCIiIjIZBiARERGRyTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik2EAEhEREZkMA5CIiIjIZBiARERERCbDACQiIiIyGQYgERERkckwAImIiIhMhgFIREREZDIMQCIiIiKTYQASERERmQwDkIiIiMhkGIBEREREJsMAJCIiIjIZBiARERGRyTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik2EAEhEREZkMA5CIiIjIZBiARERERCbDACQiIiIyGQYgERERkckwAImIiIhMhgFIREREZDIMQCIiIiKTYQASERERmQwDkIiIiMhkGIBEREREJsMAJCIiIjIZBiARERGRyTAAiYiIiEyGAUhERERkMgxAIiIiIpNhABIRERGZDAOQiIiIyGQYgEREREQmwwAkIiIiMhkGIBEREZHJMACJiIiITIYBSERERGQyDEAiIiIik/k/h6oyswryVSAAAAAASUVORK5CYII=";

// module.exports = {constants}
module.exports = {
  HOST_URL_RESET_PASSWORD,
  HOST_URL_VERIFY_USER,
  COMPANY_NAME,
  DOMAIN_URL,
  SUPPORT_EMAIL_ID,
  SUPPORT_EMAIL_PASSWORD,
  RESET_PASSWORD_IMAGE,
  SERVER_URL,
};
