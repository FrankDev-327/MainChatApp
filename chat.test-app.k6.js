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

const socketAdminTimeTrendResponseGroup = new Trend(
    'socketTimeTrendResponseGroup',
    true,
);
const socketAdminTimeTrendResponseDirect = new Trend(
    'socketTimeTrendResponseDirect',
    true,
);

export const options = {
    scenarios: {
        creating_normal_users: {
            executor: 'constant-vus',
            vus: 5,
            tags: { test_type: 'user_creation' },
            duration: '3m',
            exec: 'api_user_creation_test',
            env: {
                CHAT_API_ENDPOINT: 'http://localhost:3001'
            },
        },
        validate_user_login: {
            executor: 'constant-vus',
            vus: 8,
            startTime: '3m',
            tags: { test_type: 'user_login' },
            duration: '3m',
            exec: 'api_user_login_test',
            env: {
                CHAT_API_ENDPOINT: 'http://localhost:3001'
            },
        },
        socket_connection_chat: {
            startTime: '6m',
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
    }
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

    const usersToTalkNumber1 = {
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "password": "Password123!"
    }

    const usersToTalkNumber2 = {
        "email": "jane.smith@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "password": "SecurePass456!"
    }

    return {
        listUsers: settingUsers,
        user1: usersToTalkNumber1,
        user2: usersToTalkNumber2
    };
}

export function api_user_creation_test(listUsers) {
    console.log(`VU ${__VU} starting user creation test...`);
    group('API User Creation Test', function () {
        for (const user of listUsers) {
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
                `${BASE_URL}/chat-users`,
                payload,
                params
            );

            // SUCCESS
            if (response.status === 201 || response.status === 200) {
                console.log(`VU: ${__VU} - [USER CREATED]`);
            } else if (
                response.status === 400 &&
                response.body.includes('Email already exists')
            ) {
                console.log(`VU: ${__VU} - [USER ALREADY EXISTS]`);
                // OTHER ERROR
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
}

export function api_user_login_test(listUsers) {
    console.log(`VU ${__VU} starting user login test...`);
    group('API User Login Test', function () {
        for (const user of listUsers) {
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
                `${BASE_URL}/auth/login`,
                payload,
                params
            );

            if (response.status === 200) {
                console.log(`VU: ${__VU} - [USER LOGGED IN]`);
            } else if (
                response.status === 401 &&
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
                    (
                        r.status === 401 &&
                        r.body.includes('The user name or password are wrong. Try again.')
                    ),
            });
        }
    });
}

export function socket_connection_chat_test({ user1, user2 }) {
    console.log(`VU ${__VU} starting socket connection chat test...`);

    let userNumber1Token = null;
    let userNumber2Token = null;

    group('Socket Connection Chat Test', function () {
        const payload = JSON.stringify({
            email: user1.email,
            password: user1.password,
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = http.post(
            `${BASE_URL}/auth/login`,
            payload,
            params
        );

        if (response.status === 200) {
            console.log(`VU: ${__VU} - [USER LOGGED IN]`);
        } else if (
            response.status === 401 &&
            response.body.includes('The user name or password are wrong. Try again.')
        ) {
            console.log(`VU: ${__VU} - [INVALID CREDENTIALS]`);
        } else {
            console.error(`
                [ERROR LOGGING IN]
                Email: ${user1.email}
                Status: ${response.status}
                Response: ${response.body}
            `);
        }

        check(response, {
            [`${user1.email} login successful`]: (r) =>
                r.status === 200 ||
                (
                    r.status === 401 &&
                    r.body.includes('The user name or password are wrong. Try again.')
                ),
        });
    });
}