document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const userNameSpan = document.getElementById('user-name');
    const groupList = document.getElementById('group-list');
    const createGroupBtn = document.getElementById('create-group-btn');
    const createGroupForm = document.getElementById('create-group-form');
    const workHabitsForm = document.getElementById('work-habits-form');
    const recommendationDiv = document.getElementById('recommendation');
    const notifications = document.getElementById('notifications');
    const trendsChartCanvas = document.getElementById('trends-chart');
    const trendsMessage = document.getElementById('trends-message');
    const teamHealthChartCanvas = document.getElementById('team-health-chart');
    const productivityChartCanvas = document.getElementById('productivity-chart');
    const hrRecommendation = document.getElementById('hr-recommendation');
    const groupMessagesModal = new bootstrap.Modal(document.getElementById('group-messages-modal'));
    const groupMessages = document.getElementById('group-messages');
    const modalGroupName = document.getElementById('modal-group-name');
    const groupMembersSpan = document.getElementById('group-members');
    const postMessageForm = document.getElementById('post-message-form');

    // Data Storage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    let workData = JSON.parse(localStorage.getItem('workData')) || {};
    let currentUser = localStorage.getItem('currentUser');

    // Initialize Sample Data (if empty)
    if (!users.length) {
        users = [
            { username: 'jane', email: 'jane@example.com', password: 'password123' },
            { username: 'mike', email: 'mike@example.com', password: 'password123' },
            { username: 'sarah', email: 'sarah@example.com', password: 'password123' }
        ];
        workData = {
            'jane': [
                { date: '2023-10-01', hours: 7.5, productivity: 'high', mood: 'happy' },
                { date: '2023-10-02', hours: 8, productivity: 'medium', mood: 'neutral' },
                { date: '2023-10-03', hours: 6.5, productivity: 'high', mood: 'happy' }
            ],
            'mike': [
                { date: '2023-10-01', hours: 9, productivity: 'low', mood: 'stressed' },
                { date: '2023-10-02', hours: 7.5, productivity: 'medium', mood: 'neutral' },
                { date: '2023-10-03', hours: 10, productivity: 'high', mood: 'happy' }
            ],
            'sarah': [
                { date: '2023-10-01', hours: 8, productivity: 'medium', mood: 'neutral' },
                { date: '2023-10-02', hours: 11, productivity: 'low', mood: 'stressed' },
                { date: '2023-10-03', hours: 7, productivity: 'high', mood: 'happy' }
            ]
        };
        groups = [
            { id: 1, name: 'Morning Motivators', description: 'Start the day strong!', members: ['jane', 'sarah'], messages: [
                { user: 'jane', text: 'Good morning team!', timestamp: Date.now() - 86400000 },
                { user: 'sarah', text: 'Ready to crush it!', timestamp: Date.now() - 43200000 }
            ]},
            { id: 2, name: 'Code & Chill', description: 'Relax and code.', members: ['mike'], messages: [
                { user: 'mike', text: 'Anyone up for a late-night session?', timestamp: Date.now() - 7200000 }
            ]}
        ];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('workData', JSON.stringify(workData));
        localStorage.setItem('groups', JSON.stringify(groups));
    }

    // App Initialization
    if (currentUser) {
        showApp(currentUser);
    } else {
        showAuth();
    }

    // Utility Functions
    function showAuth() {
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }

    function showApp(username) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        userNameSpan.textContent = username;
        loadDashboard(username);
        setupNavigation();
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.getElementById('dashboard').style.display = 'block';
    }

    function setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const section = link.dataset.section;
                document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
                document.getElementById(section).style.display = 'block';
                if (section === 'hr-insights') renderTeamInsights();
            });
        });
    }

    function loadDashboard(username) {
        displayGroups(username);
        renderTrendsChart(username);
    }

    // Authentication
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        if (users.some(u => u.email === email || u.username === username)) {
            document.getElementById('signup-error').textContent = 'Username or email already exists.';
            return;
        }
        if (password.length < 6) {
            document.getElementById('signup-error').textContent = 'Password must be at least 6 characters.';
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Sign-up successful! Please log in.', 'success');
        showLogin();
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', user.username);
            showApp(user.username);
            showNotification(`Welcome back, ${user.username}!`, 'success');
        } else {
            document.getElementById('login-error').textContent = 'Invalid email or password.';
        }
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        showAuth();
        showNotification('Logged out successfully.', 'info');
    });

    document.getElementById('show-signup').addEventListener('click', () => {
        loginSection.style.display = 'none';
        signupSection.style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', showLogin);

    function showLogin() {
        signupSection.style.display = 'none';
        loginSection.style.display = 'block';
        document.getElementById('signup-error').textContent = '';
        document.getElementById('login-error').textContent = '';
    }

    // Work Habits & AI Model
    workHabitsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const hours = parseFloat(document.getElementById('hours-worked').value);
        const productivity = document.getElementById('productivity').value;
        const mood = document.getElementById('mood').value;

        if (hours < 0 || hours > 24) {
            showNotification('Hours must be between 0 and 24.', 'danger');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!workData[currentUser]) workData[currentUser] = [];
        
        // Prevent duplicate entries for the same day
        const existingEntry = workData[currentUser].find(d => d.date === today);
        if (existingEntry) {
            existingEntry.hours = hours;
            existingEntry.productivity = productivity;
            existingEntry.mood = mood;
        } else {
            workData[currentUser].push({ date: today, hours, productivity, mood });
        }
        localStorage.setItem('workData', JSON.stringify(workData));

        const analysis = analyzeWorkHabits(currentUser);
        recommendationDiv.innerHTML = `<strong>AI Insight:</strong> ${analysis.recommendation}`;
        recommendationDiv.className = `alert alert-${analysis.alertType}`;
        recommendationDiv.style.display = 'block';
        renderTrendsChart(currentUser);
        showNotification('Work habits recorded successfully.', 'success');
    });

    function analyzeWorkHabits(username) {
        const userData = workData[username] || [];
        if (userData.length === 0) {
            return { recommendation: 'Please log some work habits to get insights.', alertType: 'info' };
        }

        const recentData = userData.slice(-5); // Last 5 days
        const avgHours = recentData.reduce((sum, d) => sum + d.hours, 0) / recentData.length;
        const productivityScore = recentData.reduce((sum, d) => sum + (d.productivity === 'high' ? 3 : d.productivity === 'medium' ? 2 : 1), 0) / recentData.length;
        const moodScore = recentData.reduce((sum, d) => sum + (d.mood === 'happy' ? 3 : d.mood === 'neutral' ? 2 : 1), 0) / recentData.length;

        const burnoutRisk = (avgHours * 0.4 + (3 - productivityScore) * 0.3 + (3 - moodScore) * 0.3) * 10;
        
        if (burnoutRisk > 75) {
            return {
                recommendation: 'High burnout risk detected! Take a day off and join a support group.',
                alertType: 'danger'
            };
        } else if (burnoutRisk > 50) {
            return {
                recommendation: 'Moderate stress levels. Schedule a break and try mindfulness exercises.',
                alertType: 'warning'
            };
        } else {
            return {
                recommendation: 'You’re thriving! Maintain your routine and share tips with your team.',
                alertType: 'success'
            };
        }
    }

    // Trends Chart
    let trendsChart;
    function renderTrendsChart(username) {
        const userData = (workData[username] || []).slice(-7); // Last 7 days
        const labels = userData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const hoursData = userData.map(d => d.hours);

        if (userData.length === 0) {
            trendsMessage.textContent = 'No data yet. Log your work habits to see trends!';
            if (trendsChart) trendsChart.destroy();
            return;
        }
        trendsMessage.textContent = '';

        if (trendsChart) trendsChart.destroy();
        trendsChart = new Chart(trendsChartCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Hours Worked',
                    data: hoursData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#007bff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Hours' }, max: 24 },
                    x: { title: { display: true, text: 'Date' } }
                }
            }
        });
    }

    // Groups Management
    function displayGroups(username) {
        groupList.innerHTML = '';
        groups.forEach(group => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            const isMember = group.members.includes(username);
            li.innerHTML = `
                <div>
                    <strong>${group.name}</strong>
                    <p class="mb-0 text-muted">${group.description}</p>
                </div>
                <div>
                    <button class="btn btn-sm ${isMember ? 'btn-danger' : 'btn-success'}" data-action="${isMember ? 'leave' : 'join'}" data-id="${group.id}">
                        ${isMember ? 'Leave' : 'Join'}
                    </button>
                    ${isMember ? `<button class="btn btn-sm btn-primary ms-2" data-action="view" data-id="${group.id}">View</button>` : ''}
                </div>
            `;
            groupList.appendChild(li);
        });

        groupList.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            const groupId = parseInt(btn.dataset.id);
            const group = groups.find(g => g.id === groupId);

            if (action === 'join') {
                if (!group.members.includes(username)) {
                    group.members.push(username);
                    showNotification(`Joined "${group.name}" successfully!`, 'success');
                }
            } else if (action === 'leave') {
                group.members = group.members.filter(m => m !== username);
                showNotification(`Left "${group.name}".`, 'info');
            } else if (action === 'view') {
                showGroupMessages(group);
            }
            localStorage.setItem('groups', JSON.stringify(groups));
            displayGroups(username);
        });
    }

    createGroupBtn.addEventListener('click', () => {
        createGroupForm.style.display = createGroupForm.style.display === 'none' ? 'block' : 'none';
    });

    createGroupForm.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('group-name').value.trim();
        const description = document.getElementById('group-description').value.trim();

        if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
            showNotification('A group with this name already exists.', 'danger');
            return;
        }

        const newGroup = {
            id: Date.now(), // Unique ID based on timestamp
            name,
            description,
            members: [currentUser],
            messages: []
        };
        groups.push(newGroup);
        localStorage.setItem('groups', JSON.stringify(groups));
        displayGroups(currentUser);
        createGroupForm.style.display = 'none';
        showNotification(`Group "${name}" created!`, 'success');
        document.getElementById('group-name').value = '';
        document.getElementById('group-description').value = '';
    });

    function showGroupMessages(group) {
        modalGroupName.textContent = group.name;
        groupMembersSpan.textContent = group.members.join(', ') || 'No members yet';
        groupMessages.innerHTML = group.messages.length > 0
            ? group.messages.map(m => `
                <li class="list-group-item">
                    <strong>${m.user}</strong>: ${m.text}
                    <small class="text-muted d-block">${new Date(m.timestamp).toLocaleString()}</small>
                </li>
            `).join('')
            : '<li class="list-group-item text-muted">No messages yet.</li>';
        groupMessagesModal.show();

        postMessageForm.onsubmit = (e) => {
            e.preventDefault();
            const text = document.getElementById('message-input').value.trim();
            if (!text) return;

            group.messages.push({ user: currentUser, text, timestamp: Date.now() });
            localStorage.setItem('groups', JSON.stringify(groups));
            showGroupMessages(group);
            showNotification(`Message posted in "${group.name}".`, 'success');
            document.getElementById('message-input').value = '';
        };
    }

    // HR Insights
    let teamHealthChart, productivityChart;
    function renderTeamInsights() {
        const allData = Object.values(workData).flat();
        if (allData.length === 0) {
            hrRecommendation.textContent = 'No team data available yet.';
            if (teamHealthChart) teamHealthChart.destroy();
            if (productivityChart) productivityChart.destroy();
            return;
        }

        // Team Health
        const riskLevels = allData.map(d => {
            const hours = d.hours;
            const prodScore = d.productivity === 'high' ? 3 : d.productivity === 'medium' ? 2 : 1;
            const moodScore = d.mood === 'happy' ? 3 : d.mood === 'neutral' ? 2 : 1;
            const score = (hours * 0.4 + (3 - prodScore) * 0.3 + (3 - moodScore) * 0.3) * 10;
            return score > 75 ? 'high' : score > 50 ? 'moderate' : 'low';
        });
        const riskCounts = { low: 0, moderate: 0, high: 0 };
        riskLevels.forEach(r => riskCounts[r]++);

        if (teamHealthChart) teamHealthChart.destroy();
        teamHealthChart = new Chart(teamHealthChartCanvas, {
            type: 'pie',
            data: {
                labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
                datasets: [{
                    data: [riskCounts.low, riskCounts.moderate, riskCounts.high],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Productivity Distribution
        const prodCounts = { low: 0, medium: 0, high: 0 };
        allData.forEach(d => prodCounts[d.productivity]++);

        if (productivityChart) productivityChart.destroy();
        productivityChart = new Chart(productivityChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    label: 'Productivity',
                    data: [prodCounts.low, prodCounts.medium, prodCounts.high],
                    backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                    borderColor: ['#b02a37', '#e0a800', '#218838'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Entries' } }
                }
            }
        });

        const highRiskPercent = (riskCounts.high / allData.length * 100).toFixed(1);
        hrRecommendation.innerHTML = highRiskPercent > 20
            ? `<strong>Alert:</strong> ${highRiskPercent}% of the team is at high risk. Recommend immediate wellness interventions and a team check-in.`
            : `<strong>Status:</strong> Team health is solid (${highRiskPercent}% high risk). Continue fostering a supportive environment.`;
    }

    // Notifications
    function showNotification(message, type = 'info') {
        const div = document.createElement('div');
        div.className = `notification alert alert-${type} alert-dismissible fade show`;
        div.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        notifications.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }
});