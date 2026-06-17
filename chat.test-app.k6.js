import http from 'k6/http';
import { io } from "k6/x/socketio";
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let creatingUserTrend = new Trend('creating_user_duration');
export let creatingUserSuccess = new Counter('creating_user_success');
export let creatingUserFailure = new Counter('creating_user_failure');

export let ws_msgs_received_groups = new Counter('ws_msgs_received_groups');
export let ws_msgs_received_direct = new Counter('ws_msgs_received_direct');
export let ws_error_connection_direct = new Counter('ws_error_connection_direct');

const socketAdminTimeTrendResponseGroup = new Trend(
    'socketTimeTrendResponseGroup',
    true,
);
const socketTimeTrendResponseDirect = new Trend(
    'socketTimeTrendResponseDirect',
    true,
);

export const options = {
    scenarios: {
        /*creating_normal_users: {
            executor: 'constant-vus',
            vus: 1,
            tags: { test_type: 'user_creation' },
            duration: '1m',
            exec: 'api_user_creation_test',
            env: {
                CHAT_API_ENDPOINT: 'http://localhost:3001'
            },
        },
        validate_user_login: {
            executor: 'constant-vus',
            vus: 1,
            startTime: '2m',
            tags: { test_type: 'user_login' },
            duration: '1m',
            exec: 'api_user_login_test',
            env: {
                CHAT_API_ENDPOINT: 'http://localhost:3001'
            },
        },*/
        socket_connection_chat: {
            //startTime: '3m',
            executor: 'ramping-vus',
            startVUs: 15,
            gracefulRampDown: '3s',
            stages: [
                { target: 15, duration: '3m' },
                { target: 30, duration: '3m' },
                { target: 50, duration: '3m' },
                { target: 0, duration: '3m' },
            ],
            tags: { test_type: 'socket_connection_chat' },
            exec: 'socket_connection_chat_test',
            env: {
                CHAT_API_ENDPOINT: 'http://localhost:3001',
                CHAT_APP_WEB_SOCKET_URL: 'ws://localhost:3001',
            },
        }
    },
    thresholds: {
        'socketTimeTrendResponseDirect{test_type:chat_api_socket_direct}': ['p(85)<5000', 'p(95)<6000'],
        'socketTimeTrendResponseGroup{test_type:chat_api_socket_group}': ['p(95)<5000', 'p(90)<6000'],
        'http_req_duration{test_type:chat_api_test}': ['p(98.9) < 1000', 'p(95) < 8500', 'p(90.5) < 7000'],
    },
}

export function handleSummary(data) {
    return {
        'normal_chat_app.html': htmlReport(data),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

export function setup() {
    console.log(`_VU: ${__VU} setting up the data...`);
    const settingUsers = [
        {
            "email": "john.doe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "password": "Password123!"
        },
        {
            "email": "jane.smith@example.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "password": "SecurePass456!"
        },
    ];

    const dataToTextMessageFromUser2 = {
        "message": "sending message from user 2 to user 5",
        "sender_id": 1,
        "receiver_id": 2,
        "parentTaskId": 0,
        "taskType": "simple",
        "message_type": "TEXT",
        "lon": "13.0708017",
        "lat": "47.7698326",
        "lonCoodinate": "13.0708017",
        "latCoodinate": "47.7698326"
    }

    const dataToTextMessageFromUser5 = {
        "message": "sending message from user 5 to user 2",
        "sender_id": 2,
        "receiver_id": 1,
        "parentTaskId": 0,
        "taskType": "simple",
        "message_type": "TEXT",
        "lon": "13.0708017",
        "lat": "47.7698326",
        "lonCoodinate": "13.0708017",
        "latCoodinate": "47.7698326"
    }

    const dataToSendCoordinateMessage5 = {
        "message": "sending coordinates from user 5 to user 2",
        "sender_id": 5,
        "receiver_id": 2,
        "taskType": "simple",
        "message_type": "COORDINATES",
        "lon": "13.0708017",
        "lat": "47.7698326",
        "lonCoodinate": "13.0708017",
        "latCoodinate": "47.7698326"
    }

    const dataToSendCoordinateMessage2 = {
        "message": "sending coordinates from user 2 to user 5",
        "sender_id": 2,
        "receiver_id": 5,
        "taskType": "simple",
        "message_type": "COORDINATES",
        "lon": "13.0708017",
        "lat": "47.7698326",
        "lonCoodinate": "13.0708017",
        "latCoodinate": "47.7698326"
    }

    const usersToTalNumber1 = {
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "password": "Password123!"
    }

    const usersToTalNumber2 = {
        "email": "jane.smith@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "password": "SecurePass456!"
    }

    return {
        listUsers: settingUsers,
        user1: usersToTalNumber1,
        user2: usersToTalNumber2,
        dataToTextMessageFromUser2: dataToTextMessageFromUser2,
        dataToTextMessageFromUser5: dataToTextMessageFromUser5,
        dataToSendCoordinateMessage2: dataToSendCoordinateMessage2,
        dataToSendCoordinateMessage5: dataToSendCoordinateMessage5,
    };
}

export function api_user_creation_test(data) {
    console.log(`VU ${__VU} starting user creation test...`);
    group('API User Creation Test', function () {
        for (const user of data.listUsers) {
            const payload = JSON.stringify({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
            });

            const params = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = http.post(
                `${__ENV.CHAT_API_ENDPOINT}/chat-users`,
                payload,
                params
            );

            // SUCCESS
            if (response.status === 201 || response.status === 200) {
                console.log(`VU: ${__VU} - [USER CREATED] ${user.firstName}`);
            } else if (
                response.status === 400 &&
                response.body.includes('Email already exists')
            ) {
                console.log(`VU: ${__VU} - [USER ALREADY EXISTS] ${user.firstName}`);
            } else {
                console.error(`
                [ERROR CREATING USER]
                Email: ${user.email}
                Status: ${response.status}
                Response: ${response.body}
            `);
            }

            check(response, {
                [`${user.email} created or already exists`]: (r) =>
                    r.status === 201 ||
                    r.status === 200 ||
                    (
                        r.status === 400 &&
                        r.body.includes('Email already exists')
                    ),
            });
        }
    });

    sleep(25);
}

export function api_user_login_test(data) {
    console.log(`VU ${__VU} starting user login test...`);
    group('API User Login Test', function () {
        for (const user of data.listUsers) {
            const payload = JSON.stringify({
                email: user.email,
                password: user.password,
            });

            const params = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = http.post(
                `${__ENV.CHAT_API_ENDPOINT}/auth/login`,
                payload,
                params
            );

            if (response.status === 200 || response.status === 201) {
                console.log(`VU: ${__VU} - [USER LOGGED IN]`);
            } else if (
                response.status === 400 &&
                response.body.includes('The user name or password are wrong. Try again.')
            ) {
                console.log(`VU: ${__VU} - [INVALID CREDENTIALS]`);
            } else {
                console.error(`
                [ERROR LOGGING IN]
                Email: ${user.email}
                Status: ${response.status}
                Response: ${response.body}
            `);
            }

            check(response, {
                [`${user.email} login successful`]: (r) =>
                    r.status === 200 ||
                    r.status === 201 ||
                    (
                        r.status === 400 &&
                        r.body.includes('The user name or password are wrong. Try again.')
                    ),
            });
        }
    });

    sleep(28);
}

export function socket_connection_chat_test(data) {
    console.log(`VU ${__VU} starting socket connection chat test...`);

    let userNumber1Token = null;
    let userNumber2Token = null;

    // --- Login User 1 ---
    const response1 = http.post(
        `${__ENV.CHAT_API_ENDPOINT}/auth/login`,
        JSON.stringify({ email: data.user1.email, password: data.user1.password }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(response1, {
        'User 1 login successful': (r) => r.status === 200 || r.status === 201,
    });

    if (response1.status !== 200 && response1.status !== 201) {
        console.error(`VU ${__VU} - [ERROR LOGGING IN User 1] Status: ${response1.status}`);
        return;
    }

    userNumber1Token = response1.json().token;
    // --- Login User 2 ---
    const response2 = http.post(
        `${__ENV.CHAT_API_ENDPOINT}/auth/login`,
        JSON.stringify({ email: data.user2.email, password: data.user2.password }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(response2, {
        'User 2 login successful': (r) => r.status === 200 || r.status === 201,
    });

    if (response2.status !== 200 && response2.status !== 201) {
        console.error(`VU ${__VU} - [ERROR LOGGING IN User 2] Status: ${response2.status}`);
        return;
    }

    userNumber2Token = response2.json().token;
    console.log(`VU ${__VU} - Both users logged in, starting socket test...`);

    // --- Socket Options ---
    // Token passed as query param (most common for Socket.IO auth)
    const socketOptionUser1 = {
        path: '/socket.io/',
        namespace: '/chat-message',
        params: {
            headers: { token: userNumber1Token, },
            tags: { scenario: 'WebSocketConnect' },
        },
    };

    const socketOptionUser2 = {
        path: '/socket.io/',
        namespace: '/chat-message',
        params: {
            headers: { token: userNumber2Token, },
            tags: { scenario: 'WebSocketConnect' },
        },

    };

    group('Users 1 and 2 direct message conversation', function () {
        sleep(25)
        let user1Connected = false;
        let user2Connected = false;
        let startTime = null;

        // --- Connect User 1 ---
        io(__ENV.CHAT_APP_WEB_SOCKET_URL, socketOptionUser1, (socketUser1) => {

            socketUser1.on('connect', () => {
                console.log(`VU ${__VU} - User 1 connected`);
                user1Connected = true;
                check(true, { 'User 1 socket connected': (v) => v === true });

                // Only emit once both are connected
                if (user1Connected && user2Connected) {
                    startTime = Date.now();
                    console.log(`VU ${__VU} - Both connected, User 1 sending message...`);
                    socketUser1.emit('entry-message', data.dataToTextMessageFromUser2);
                }
            });

            socketUser1.on('direct-message', (msg) => {
                const duration = Date.now() - startTime;
                ws_msgs_received_direct.add(1, { test_type: 'chat_api_socket_direct' });
                socketTimeTrendResponseDirect.add(duration, { test_type: 'chat_api_socket_direct' });
                check(true, { 'User 1 received direct message': (v) => v === true });
                console.log(`VU ${__VU} - User 1 received message:`, msg);
                socketUser1.close();
            });

            socketUser1.on('disconnect', () => {
                console.log(`VU ${__VU} - User 1 disconnected`);
                check(true, { 'User 1 disconnected cleanly': (v) => v === true });
            });

            socketUser1.on('error', (err) => {
                ws_error_connection_direct.add(1, { test_type: 'chat_api_socket_direct' });
                console.error(`VU ${__VU} - User 1 socket error:`, err);
                socketUser1.close();
            });

            // --- Connect User 2 ---
            io(__ENV.CHAT_APP_WEB_SOCKET_URL, socketOptionUser2, (socketUser2) => {

                socketUser2.on('connect', () => {
                    console.log(`VU ${__VU} - User 2 connected`);
                    user2Connected = true;
                    check(true, { 'User 2 socket connected': (v) => v === true });

                    // Only emit once both are connected
                    if (user1Connected && user2Connected) {
                        startTime = Date.now();
                        console.log(`VU ${__VU} - Both connected, User 2 sending message...`);
                        socketUser2.emit('entry-message', data.dataToTextMessageFromUser5);
                    }
                });

                socketUser2.on('direct-message', (msg) => {
                    const duration = Date.now() - startTime;
                    ws_msgs_received_direct.add(1, { test_type: 'chat_api_socket_direct' });
                    socketTimeTrendResponseDirect.add(duration, { test_type: 'chat_api_socket_direct' });
                    check(true, { 'User 2 received direct message': (v) => v === true });
                    console.log(`VU ${__VU} - User 2 received message:`, msg);
                    socketUser2.close();
                });

                socketUser2.on('disconnect', () => {
                    console.log(`VU ${__VU} - User 2 disconnected`);
                    check(true, { 'User 2 disconnected cleanly': (v) => v === true });
                });

                socketUser2.on('error', (err) => {
                    ws_error_connection_direct.add(1, { test_type: 'chat_api_socket_direct' });
                    console.error(`VU ${__VU} - User 2 socket error:`, err);
                    socketUser2.close();
                });
            });

            sleep(30); // Keep VU alive long enough for messages to exchange
        });
    });
}

/*export function socket_connection_chat_test(data) {
    console.log(`VU ${__VU} starting socket connection chat test...`);

    let userNumber1Token = null;
    let userNumber2Token = null;

    group('Socket Connection Chat Test User Number #1', function () {
        const payload = JSON.stringify({
            email: data.user1.email,
            password: data.user1.password,
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = http.post(
            `${__ENV.CHAT_API_ENDPOINT}/auth/login`,
            payload,
            params
        );

        check(response, {
            [`${data.user1.email} login successful`]: (r) =>
                r.status === 200 || response.status === 201 ||
                (
                    r.status === 400 &&
                    r.body.includes('The user name or password are wrong. Try again.')
                ),
        });

        if (response.status === 200 || response.status === 201) {
            userNumber1Token = response.json().token;
            group('Socket Connection Chat Test User Number #1', function () {
                console.log(`VU: ${__VU} - [USERS LOGGED IN]`);
                const payload2 = JSON.stringify({
                    email: data.user2.email,
                    password: data.user2.password,
                });

                const params2 = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                const response2 = http.post(
                    `${__ENV.CHAT_API_ENDPOINT}/auth/login`,
                    payload2,
                    params2
                );

                if (response2.status === 200 || response.status === 201) {
                    userNumber2Token = response2.json().token;
                    //TODO Socket start here...
                    console.log(`VU: ${__VU} Socket process start from here...`);
                    const socketOptionUser1 = {
                        path: '/socket.io/',
                        namespace: '/chat-message',
                        params: {
                            headers: { token: userNumber1Token },
                            tags: { scenario: 'WebSocketConnect' },
                        },
                    };

                    const socketOptionUser2 = {
                        path: '/socket.io/',
                        namespace: '/chat-message',
                        params: {
                            headers: { token: userNumber2Token },
                            tags: { scenario: 'WebSocketConnect' },
                        },
                    };

                    group('Users number 2 and number 5 start convertation', function () {
                        const startAdminDirect = Date.now();
                        io(__ENV.CHAT_APP_WEB_SOCKET_URL, socketOptionUser1, (socketUser1 => {
                            socketUser1.on('connect', () => {
                                console.log(`VU user connected: ${__VU}`);
                                check(true, { 'emit test event': (v) => v === true });
                            });

                            //TODO Socket user-2 connection
                            io(__ENV.CHAT_APP_WEB_SOCKET_URL, socketOptionUser2, (socketUser2 => {
                                socketUser2.on('connect', () => {
                                    console.log(`VU user connected: ${__VU}`);
                                    check(true, { 'emit test event': (v) => v === true });
                                    socketUser1.emit('entry-message', data.dataToTextMessageFromUser2);
                                });

                                socketUser2.on('direct-message', (msg) => {
                                    const endAdmin = Date.now();
                                    ws_msgs_received_direct.add(1, { test_type: 'chat_api_socket_direct' });
                                    const duration = endAdmin - startAdminDirect;
                                    socketTimeTrendResponseDirect.add(duration, { test_type: 'chat_api_socket_direct' });
                                    check(true, { 'emit direct message received': (v) => v === true });
                                    console.log(`VU ${__VU} getting direct message from socket`, msg);
                                    socket.close();
                                });

                                socketUser2.emit('entry-message', data.dataToTextMessageFromUser5);
                                socketUser1.on('direct-message', (msg) => {
                                    const endAdmin = Date.now();
                                    ws_msgs_received_direct.add(1, { test_type: 'chat_api_socket_direct' });
                                    const duration = endAdmin - startAdminDirect;
                                    socketTimeTrendResponseDirect.add(duration, { test_type: 'chat_api_socket_direct' });
                                    check(true, { 'emit direct message received': (v) => v === true });
                                    console.log(`VU ${__VU} getting direct message from socket`, msg);
                                    socket.close();
                                });

                                socketUser2.on('disconnect', () => {
                                    check(true, { disconnect: (v) => v === true });
                                    console.log(`VU user disconnect: ${__VU}`);
                                    socketUser2.close();
                                });

                                socketUser2.on('error', (err) => {
                                    ws_error_connection_direct.add(1, { test_type: 'chat_api_socket_direct' });
                                    console.error(`VU ${__VU} webSocket error:`, err);
                                    socketUser2.close();
                                });
                            }));

                            socketUser1.on('disconnect', () => {
                                check(true, { disconnect: (v) => v === true });
                                console.log(`VU user disconnect: ${__VU}`);
                                socketUser1.close();
                            });

                            socketUser1.on('error', (err) => {
                                ws_error_connection_direct.add(1, { test_type: 'chat_api_socket_direct' });
                                console.error(`VU ${__VU} webSocket error:`, err);
                                socketUser1.close();
                            });
                        }));

                        sleep(30);
                    });

                } else if (
                    response2.status === 401 &&
                    response2.body.includes('The user name or password are wrong. Try again.')
                ) {
                    console.log(`VU: ${__VU} - [INVALID CREDENTIALS User Number #2]`);
                } else {
                    console.error(`
                        [ERROR LOGGING IN User - 2]
                        Email: ${data.user2.email}
                        Status: ${response.status}
                        Response: ${response.body}
                    `);
                }
            });
        } else if (
            response.status === 401 &&
            response.body.includes('The user name or password are wrong. Try again.')
        ) {
            console.log(`VU: ${__VU} - [INVALID CREDENTIALS User Number #1]`);
        } else {
            console.error(`
                [ERROR LOGGING IN User - 1]
                Email: ${data.user1.email}
                Status: ${response.status}
                Response: ${response.body}
            `);
        }
    });
}*/


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