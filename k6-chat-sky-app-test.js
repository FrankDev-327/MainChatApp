import http from 'k6/http';
import { io } from "k6/x/socketio";
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let ws_msgs_received_admin_groups = new Counter('ws_msgs_received_admin_groups');
export let ws_msgs_received_admin_direct = new Counter('ws_msgs_received_admin_direct');
export let ws_msgs_received_admin_direct_task = new Counter('ws_msgs_received_admin_direct_task');
export let ws_error_connection_admin_group = new Counter('ws_error_connection_admin_group');
export let ws_error_connection_admin_direct = new Counter('ws_error_connection_admin_direct');
export let ws_error_connection_admin_direct_task = new Counter('ws_error_connection_admin_direct_task');

const uploadFileTrend = new Trend('uploadFileTrend', true);
const fileToBeUploaded = open('./SamusAran.jpg', 'b');
const socketAdminTimeTrendResponseGroup = new Trend(
  'socketAdminTimeTrendResponseGroup',
  true,
);
const socketAdminTimeTrendResponseDirect = new Trend(
  'socketAdminTimeTrendResponseDirect',
  true,
);
const socketAdminTimeTrendResponseDirectTask = new Trend(
  'socketAdminTimeTrendResponseDirectTask',
  true,
);

export const options = {
  scenarios: {
    //TODO --- 1. This scenario is for testing the chat API endpoints with a constant number of VUs.
    //  It will run for 8 minutes and execute the 'chat_api_test' function. The environment variable 'CHAT_API_ENDPOINT' is set to the local server URL.
    chat_api_scenario: {
      executor: 'constant-vus',
      vus: 15,
      tags: { test_type: 'chat_api_endpoints' },
      duration: '20m',
      exec: 'chat_api_test',
      env: {
        CHAT_API_ENDPOINT: 'http://localhost:3001'
      },
    },
    //TODO --- 2. This scenario is for testing the WebSocket connection and messaging functionality of the chat application.
    // It uses a ramping arrival rate executor to simulate a gradual increase in load over time. The test starts after a 30-second 
    // delay and ramps up from 10 iterations every 3 seconds to a maximum of 15 iterations every 3 seconds,
    //  with various stages of load in between. The environment variables for the chat API endpoint and WebSocket URL are set to the local server URLs.
    chat_api_socket_group_scenario: {
      executor: 'ramping-vus',
      startVUs: 15,
      gracefulRampDown: '3s',
      stages: [
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'chat_api_socket_group' },
      exec: 'chat_socket_group_message_test',
      env: {
        CHAT_API_ENDPOINT: 'http://localhost:3001',
        CHAT_APP_WEB_SOCKET_URL: 'ws://localhost:3001',
      },
    },
    //TODO --- 3. This scenario is for testing the WebSocket connection and messaging functionality of the chat application with a focus on direct messages.
    // Similar to the previous scenario, it uses a ramping arrival rate executor to simulate a gradual increase in load over time. 
    // The test starts after a 30-second delay and ramps up from 10 iterations every 3 seconds to a maximum 
    // of 15 iterations every 3 seconds, with various stages of load in between. The environment variables for the chat API endpoint and WebSocket URL are set to the local server URLs.
    chat_api_socket_direct_scenario: {
      executor: 'ramping-vus',
      startVUs: 20,
      gracefulRampDown: '6s',
      stages: [
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '20m', target: 30 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'chat_api_socket_direct' },
      exec: 'chat_socket_direct_message_test',
      env: {
        CHAT_API_ENDPOINT: 'http://localhost:3001',
        CHAT_APP_WEB_SOCKET_URL: 'ws://localhost:3001',
      },
    },
    chat_socket_direct_task_message_scenario: {
      executor: 'ramping-vus',
      startVUs: 30,
      gracefulRampDown: '9s',
      stages: [
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '2m', target: 0 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '5m', target: 10 },
        { duration: '10m', target: 15 },
        { duration: '34m', target: 26 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'chat_api_socket_direct_task' },
      exec: 'chat_socket_direct_task_message_test',
      env: {
        CHAT_API_ENDPOINT: 'http://localhost:3001',
        CHAT_APP_WEB_SOCKET_URL: 'ws://localhost:3001',
      },
    },
  },
  thresholds: {
    'uploadFileTrend{test_type:chat_api_socket_group}': ['p(95)<900', 'p(90)<1000'],
    'socketAdminTimeTrendResponseGroup{test_type:chat_api_socket_group}': ['p(95)<5000', 'p(90)<6000'],
    'socketAdminTimeTrendResponseDirect{test_type:chat_api_socket_direct}': ['p(95)<5000', 'p(90)<6000'],
    'socketAdminTimeTrendResponseDirectTask{test_type:chat_api_socket_direct_task}': ['p(95)<5000', 'p(90)<6000'],
    http_req_failed: ['rate<0.03'],
    'http_req_duration{test_type:chat_api_test}': ['p(98.9) < 1000', 'p(95) < 8500', 'p(90.5) < 7000'],
  },
}

export function handleSummary(data) {
  return {
    'chat_sky_track_app.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

export function setup() {
  console.log('Setup: Preparing test data and configurations.');
  const userCredentials = {
    userName: 'artadmin',
    password: 'juricaperica',
    checkTypeAuth: '',
  };

  const chatDataNoGroup = {
    message: 'testing direct messages',
    sender_id: 162,
    receiver_id: 162,
    parentTaskId: 144,
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: 0,
    message_type: 'TEXT',
    is_notification: 0,
    lon: '13.0708017',
    lat: '47.7698326',
    lonCoodinate: '13.0708017',
    latCoodinate: '47.7698326',
  };

  const chatDataWithGroup = {
    message: 'testing task to be inserted into the db',
    group_id: 1,
    sender_id: 162,
    receiver_id: 162,
    parentTaskId: 144,
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: 0,
    message_type: 'TEXT',
    is_notification: 0,
    lon: '13.0708017',
    lat: '47.7698326',
    lonCoodinate: '13.0708017',
    latCoodinate: '47.7698326',
  };

  const chatDataWithTask = {
    message: 'testing task to be inserted into the db',
    sender_id: 162,
    receiver_id: 162,
    taskId: 3,
    parentTaskId: 144,
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: 0,
    message_type: 'TEXT',
    is_notification: 0,
    lon: '13.0708017',
    lat: '47.7698326',
    lonCoodinate: '13.0708017',
    latCoodinate: '47.7698326',
  };

  const chatDataWithLocaltion = {
    message: 'testing task to be inserted into the db',
    sender_id: 162,
    receiver_id: 162,
    parentTaskId: 144,
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: 0,
    message_type: 'TEXT',
    is_notification: 0,
    lon: '13.0708017',
    lat: '47.7698326',
    lonCoodinate: '13.0708017',
    latCoodinate: '47.7698326',
  };

  console.log('Setup: Test data prepared.');
  return {
    task: chatDataWithTask,
    chatDataNoGroup: chatDataNoGroup,
    userCredentials: userCredentials,
    chatDataWithGroup: chatDataWithGroup,
    chatDataWithLocaltion: chatDataWithLocaltion
  };
}

export function chat_api_test(data) {
  console.log(`VU: ${__VU} is staring chat_api_testing...`);
  let userToken;

  //TODO --- 1. HTTP Setup/Login ---
  group('health check section', function () {
    let healthcheckResponse = http.get(`${__ENV.CHAT_API_ENDPOINT}/health`);
    check(healthcheckResponse, { 'Api is up: ': (r) => r.status === 200 });
    sleep(5);
  });

  //TODO --- 2. HTTP Setup/Login ---
  group('admin user login section', function () {
    let params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'user/admin login' },
    };

    let loginAdminUser = http.post(
      `${__ENV.CHAT_API_ENDPOINT}/authentication/login`,
      JSON.stringify(data.userCredentials),
      params,
    );

    const isOk = check(loginAdminUser, {
      'Admin login status is 200': (r) => r.status == 200 || r.status == 201,
      'Response has body': (r) => r.body !== null,
    });

    if (isOk) {
      userToken = loginAdminUser.json().token;
      console.log(`Token captured: ${userToken.substring(0, 10)}...`);
    } else {
      console.error(
        `Login failed! Status: ${loginAdminUser.status} Error: ${loginAdminUser.error}`,
      );
      return;
    }

    sleep(8);
  });

  //TODO --- 3. Task operations ---
  group('task section', function () {
    group('creating new task:', function () {
      const taskCreated = http.post(
        `${__ENV.CHAT_API_ENDPOINT}/task/create`,
        JSON.stringify(data.task),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          tags: { name: 'Create Task' },
        },
      );

      check(taskCreated, {
        'Task creation status is 200': (r) =>
          r.status === 200 || r.status === 201,
        'Task creation response has body': (r) => r.body !== null,
      });
      sleep(12);
    });

    group(
      'getting all tasks by filter: driver_id, task_type and date_filter parameter: ',
      function () {
        const TASK_ENDPOINT = `task/drivers/162?typeStatus=assigned&filterByDate=this_month`;
        const getAllTasks = http.get(`${__ENV.CHAT_API_ENDPOINT}/${TASK_ENDPOINT}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          tags: { name: 'Get All Tasks by DriverId' },
        });

        check(getAllTasks, {
          'Get all tasks status is 200': (r) =>
            r.status === 200 || r.status === 201,
          'Get all tasks response has body': (r) => r.body !== null,
        });

        sleep(16);
      },
    );

    group('getting single task by id (exists): ', function () {
      const TASK_ID_EXIST = 2;
      const getSingleTask = http.get(`${__ENV.CHAT_API_ENDPOINT}/task/${TASK_ID_EXIST}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        tags: { name: 'Get Single Task' },
      });

      check(getSingleTask, {
        'Get single task status is 200': (r) =>
          r.status === 200 || r.status === 201,
        'Get single task response has body': (r) => r.body !== null,
      });

      if (getSingleTask) {
        console.log(`Task with Id ${TASK_ID_EXIST} does exist, as expected.`);
      }

      sleep(18);
    });

    group('getting single task by id (does not exist): ', function () {
      const TASK_ID_DONT_EXIT = 100;
      const getSingleTask = http.get(`${__ENV.CHAT_API_ENDPOINT}/task/${TASK_ID_DONT_EXIT}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        tags: { name: 'Get Single Task' },
      });
      check(getSingleTask, {
        'Get single task response has no body': (r) =>
          r.body.subtasks === undefined || r.body.subtasks.length === 0,
      });

      if (
        getSingleTask.body.subtasks &&
        getSingleTask.body.subtasks.length <= 0
      ) {
        console.log(
          ` ${__VU}: Task with ID ${TASK_ID_DONT_EXIT} does not exist, as expected.`,
        );
      }

      sleep(20);
    });
  });

  //TODO --- 4. File upload ---
  group('upload file section', function () {
    let formData = new FormData();
    formData.append(
      'file',
      http.file(
        fileToBeUploaded,
        `SamusAran-${new Date().toISOString()}.jpg`,
        'image/jpeg',
      ),
    );
    formData.append('message_type', 'IMAGE');
    formData.append('sender_id', '162');
    formData.append('receiver_id', '162');
    formData.append('is_notification', '0');
    formData.append('is_urgent', '0');

    const uploadParams = {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      tags: { name: 'File Upload' },
    };

    const uploadStart = Date.now();
    let uploadRes = http.post(`${__ENV.CHAT_API_ENDPOINT}/uploadfiles`, formData.body(), {
      headers: uploadParams.headers,
      tags: uploadParams.tags,
    });

    uploadFileTrend.add(Date.now() - uploadStart);
    const uploadCheck = check(uploadRes, {
      'File upload status is 200': (r) => r.status === 200 || r.status === 201,
    });

    if (uploadCheck) {
      console.log(`VU ${__VU} File uploaded successfully`);
    }
  });

  sleep(25);
}

export function chat_socket_direct_message_test(data) {
  console.log(`VU ${__VU} starting chat_socket_direct_message_test...`);
  let userToken;

  //TODO --- 1. HTTP Setup/Login ---
  group('admin user login section socket - 1', function () {
    let params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'user/admin login' },
    };

    let loginAdminUser = http.post(
      `${__ENV.CHAT_API_ENDPOINT}/authentication/login`,
      JSON.stringify(data.userCredentials),
      params,
    );

    const isOk = check(loginAdminUser, {
      'Admin login status is 200': (r) => r.status == 200 || r.status == 201,
      'Response has body': (r) => r.body !== null,
    });

    if (isOk) {
      userToken = loginAdminUser.json().token;
      console.log(`Token captured: ${userToken.substring(0, 10)}...`);
    } else {
      console.error(
        `Login failed! Status: ${loginAdminUser.status} Error: ${loginAdminUser.error}`,
      );
      return;
    }

    sleep(28);
  });

  const options = {
    path: '/socket.io/',
    namespace: '/chat-message',
    params: {
      headers: { token: userToken },
      tags: { scenario: 'WebSocketConnect' },
    },
  };

  //TODO --- 2. WebSocket connection and direct messaging ---
  group('testing socket connection and direct message', function () {
    const startAdminDirect = Date.now();
    io(__ENV.CHAT_APP_WEB_SOCKET_URL, options, (socket) => {
      socket.on('connect', () => {
        console.log(`VU user connected: ${__VU}`);
        check(true, { 'emit test event': (v) => v === true });
        socket.emit('entry-message', data.chatDataNoGroup);
      });

      socket.on('direct-message', (msg) => {
        const endAdmin = Date.now();
        ws_msgs_received_admin_direct.add(1, { test_type: 'chat_api_socket_direct' });
        const duration = endAdmin - startAdminDirect;
        socketAdminTimeTrendResponseDirect.add(duration, { test_type: 'chat_api_socket_direct' });
        check(true, { 'emit direct message received': (v) => v === true });
        console.log(`VU ${__VU} getting direct message from socket`, msg);
        socket.close();
      });

      socket.on('disconnect', () => {
        check(true, { disconnect: (v) => v === true });

        console.log(`VU user disconnect: ${__VU}`);
        socket.close();
      });

      socket.on('error', (err) => {
        ws_error_connection_admin_direct.add(1, { test_type: 'chat_api_socket_direct' });
        console.error(`VU ${__VU} webSocket error:`, err);
        socket.close();
      });
    });

    sleep(30);
  });
}

export function chat_socket_group_message_test(data) {
  console.log(`VU ${__VU} starting chat_socket_group_message_test...`);
  let userToken;

  //TODO --- 1. HTTP Setup/Login ---
  group('admin user login section socket - 2', function () {
    let params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'user/admin login' },
    };

    let loginAdminUser = http.post(
      `${__ENV.CHAT_API_ENDPOINT}/authentication/login`,
      JSON.stringify(data.userCredentials),
      params,
    );

    const isOk = check(loginAdminUser, {
      'Admin login status is 200': (r) => r.status == 200 || r.status == 201,
      'Response has body': (r) => r.body !== null,
    });

    if (isOk) {
      userToken = loginAdminUser.json().token;
      console.log(`Token captured: ${userToken.substring(0, 10)}...`);
    } else {
      console.error(
        `Login failed! Status: ${loginAdminUser.status} Error: ${loginAdminUser.error}`,
      );
      return;
    }

    sleep(32);
  });

  const options = {
    path: '/socket.io/',
    namespace: '/chat-message',
    params: {
      headers: { token: userToken },
      tags: { scenario: 'WebSocketConnect' },
    },
  };

  //TODO --- 2. WebSocket connection and group messaging ---
  group('testing connection to socket and entry message ', function () {
    const startAdminGroup = Date.now();
    io(__ENV.CHAT_APP_WEB_SOCKET_URL, options, (socket) => {
      socket.on('connect', () => {
        console.log(`VU user connected: ${__VU}`);
        check(true, { 'emit test event': (v) => v === true });
        socket.emit('entry-message', data.chatDataWithGroup);
      });

      socket.on('group-message', (msg) => {
        const endAdmin = Date.now();
        const duration = endAdmin - startAdminGroup;
        ws_msgs_received_admin_groups.add(1, { test_type: 'chat_api_socket_group' });
        socketAdminTimeTrendResponseGroup.add(duration, { test_type: 'chat_api_socket_group' });
        check(true, { 'emit group message received': (v) => v === true });
        console.log(`VU ${__VU} getting group message from socket`, msg);
        socket.close();
      });

      socket.on('disconnect', () => {
        check(true, { disconnect: (v) => v === true });
        console.log(`VU user disconnect duraction for user: ${__VU} time: ${duration}`);
      });

      socket.on('error', (err) => {
        ws_error_connection_admin_group.add(1, { test_type: 'chat_api_socket_group' });
        console.error(`VU ${__VU} webSocket error:`, err);
        socket.close();
      });
    });
    sleep(34);
  });
}

export function chat_socket_direct_task_message_test(data) {
  console.log(`VU ${__VU} starting chat_socket_direct_task_message_test...`);
  let userToken;

  //TODO --- 1. HTTP Setup/Login ---
  group('admin user login section socket - 3', function () {
    let params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'user/admin login' },
    };

    let loginAdminUser = http.post(
      `${__ENV.CHAT_API_ENDPOINT}/authentication/login`,
      JSON.stringify(data.userCredentials),
      params,
    );

    const isOk = check(loginAdminUser, {
      'Admin login status is 200': (r) => r.status == 200 || r.status == 201,
      'Response has body': (r) => r.body !== null,
    });

    if (isOk) {
      userToken = loginAdminUser.json().token;
      console.log(`Token captured: ${userToken.substring(0, 10)}...`);
    } else {
      console.error(
        `Login failed! Status: ${loginAdminUser.status} Error: ${loginAdminUser.error}`,
      );
      return;
    }

    sleep(5);
  });

  const options = {
    path: '/socket.io/',
    namespace: '/chat-message',
    params: {
      headers: { token: userToken },
      tags: { scenario: 'WebSocketConnect' },
    },
  };

  //TODO --- 2. WebSocket connection and direct messaging with task ---
  group('testing socket connection and direct message with task', function () {
    const startAdminDirectTask = Date.now();
    io(__ENV.CHAT_APP_WEB_SOCKET_URL, options, (socket) => {
      socket.on('connect', () => {
        console.log(`VU user connected: ${__VU}`);
        check(true, { 'emit test event': (v) => v === true });
        socket.emit('task-message', data.task);
      });

      socket.on(`direct-task-message-${data.task.taskId}`, (msg) => {
        ws_msgs_received_admin_direct_task.add(1, { test_type: 'chat_api_socket_direct_task' });
        const endAdmin = Date.now();
        const duration = endAdmin - startAdminDirectTask;
        socketAdminTimeTrendResponseDirectTask.add(duration, { test_type: 'chat_api_socket_direct_task' });
        check(true, { 'emit direct task message received': (v) => v === true });
        console.log(`VU getting direct task message from socket ${__VU}:`, msg);
        socket.close();
      });

      socket.on('disconnect', () => {
        check(true, { disconnect: (v) => v === true });
        console.log(`VU user disconnect: ${__VU}`);
      });

      socket.on('error', (err) => {
        ws_error_connection_admin_direct_task.add(1, { test_type: 'chat_api_socket_direct_task' });
        console.error(`VU ${__VU} webSocket error:`, err);
        socket.close();
      });
    });

    sleep(37);
  });
}

export function teardown(data) {
  console.log("Teardown: Test completed.");
  console.log(`Teardown: Data passed to teardown: ${JSON.stringify(data)}`);
  const bearerToken = `
      iJ2Yyg7MnwJZBLzLI2SO33DkAZRNToPciBXIsvquHBKYhPVdbLJkBqnhlJbQlTRyYELBAiad6oVuxJSbi0qFSnkBFInWKEcTWglHWWnRCDorMXnYutJjgbfuK1yL8HREOxtHPqGc8TrbQYrVBB955CxSZ618wHzrpDp4vvq45hAff1M1Abx4W5zD1
    `.trim();

  const urlDeleteMessages = 'http://localhost:3001/chat-private-messages';
  const urlDeleteTokens = 'http://localhost:3001/token'
  let params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    },
  };

  check(http.del(urlDeleteMessages, {}, params), {
    'All messages were deleted': (r) => r.status == 200 || r.status == 201,
  });

  check(http.del(urlDeleteTokens, {}, params), {
    'All tokens were deleted': (r) => r.status == 200 || r.status == 201,
  });
}

