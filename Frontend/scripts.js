// Constants
const USERS_KEY = 'wedding-app-users';
const EVENTS_KEY = 'wedding-app-events';
const USER_REGISTRATIONS_KEY = 'wedding-app-registrations';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    setupEventListeners();
    checkCurrentUser();
});

// Initialize Storage
function initializeStorage() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify({
            'admin': { password: 'admin123', role: 'Admin' }
        }));
    }
    if (!localStorage.getItem(EVENTS_KEY)) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(USER_REGISTRATIONS_KEY)) {
        localStorage.setItem(USER_REGISTRATIONS_KEY, JSON.stringify({}));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Register
    document.getElementById('register-btn').addEventListener('click', handleRegistration);

    // Login
    document.getElementById('login-btn').addEventListener('click', handleLogin);

    // Logout
    document.getElementById('user-logout-btn').addEventListener('click', logout);
    document.getElementById('admin-logout-btn').addEventListener('click', logout);

    // Add Event
    document.getElementById('add-event-btn').addEventListener('click', handleAddEvent);

    // Navigation
    document.getElementById('switch-to-login').addEventListener('click', showLoginContainer);
    document.getElementById('switch-to-register').addEventListener('click', showRegisterContainer);

    // Show Registered Events
    document.getElementById('show-registered-events-btn').addEventListener('click', renderRegisteredEvents);
}

// Handle Registration
function handleRegistration() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    if (!username || !password) {
        alert('Please fill in all fields!');
        return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    if (users[username]) {
        alert('Username already exists!');
        return;
    }

    users[username] = { password, role };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Directly log in and render dashboard after registration
    localStorage.setItem('currentUser', JSON.stringify({ username, role }));
    renderDashboard(role);
}

// Handle Login
function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users[username];

    if (!user || user.password !== password) {
        alert('Invalid username or password!');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ username, role: user.role }));
    renderDashboard(user.role);
}

// Render Dashboard
function renderDashboard(role) {
    hideAllContainers();

    if (role === 'Admin') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        renderAdminEvents();
    } else {
        document.getElementById('user-dashboard').classList.remove('hidden');
        renderUserEvents();
        renderRegisteredEvents(); // Display registered events when user logs in
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('username').textContent = currentUser.username;
}

// Hide All Containers
function hideAllContainers() {
    document.getElementById('register-container').classList.add('hidden');
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

// Handle Add Event
function handleAddEvent() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value;

    if (!title || !date || !location) {
        alert('Please fill all event details!');
        return;
    }

    const events = JSON.parse(localStorage.getItem(EVENTS_KEY));
    const newEvent = { 
        id: Date.now(), 
        title, 
        date, 
        location 
    };
    events.push(newEvent);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    alert('Event added successfully!');
    renderAdminEvents();

    // Clear input fields
    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-location').value = '';
}

// Render Admin Events
function renderAdminEvents() {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY));
    const adminEventsList = document.getElementById('admin-events-list');
    adminEventsList.innerHTML = '';

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
            <div class="card">
                <h3>${event.title}</h3>
                <p>${event.date} at ${event.location}</p>
                <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;
        adminEventsList.appendChild(eventDiv);
    });
}

// Delete Event
function deleteEvent(eventId) {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY));
    const updatedEvents = events.filter(event => event.id !== eventId);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));

    alert('Event deleted successfully!');
    renderAdminEvents(); // Re-render admin event list
}

// Render User Events (View Available Events)
function renderUserEvents() {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY));
    const userEventsList = document.getElementById('user-events-list');
    userEventsList.innerHTML = '';

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
            <div class="card">
                <h3>${event.title}</h3>
                <p>${event.date} at ${event.location}</p>
                <button onclick="registerForEvent(${event.id})">Register</button>
            </div>
        `;
        userEventsList.appendChild(eventDiv);
    });
}

// Register for Event
function registerForEvent(eventId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const registrations = JSON.parse(localStorage.getItem(USER_REGISTRATIONS_KEY));

    if (!registrations[currentUser.username]) {
        registrations[currentUser.username] = [];
    }

    const events = JSON.parse(localStorage.getItem(EVENTS_KEY));
    const eventToRegister = events.find(event => event.id === eventId);

    if (eventToRegister) {
        registrations[currentUser.username].push(eventToRegister);
        localStorage.setItem(USER_REGISTRATIONS_KEY, JSON.stringify(registrations));
        alert('Successfully registered for the event!');
        renderRegisteredEvents();  // Refresh the registered events list
    }
}

// Render Registered Events
function renderRegisteredEvents() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const registrations = JSON.parse(localStorage.getItem(USER_REGISTRATIONS_KEY));
    
    const userRegisteredEvents = registrations[currentUser.username] || [];
    const registeredEventsList = document.getElementById('user-registered-events-list');
    registeredEventsList.innerHTML = '';

    if (userRegisteredEvents.length === 0) {
        registeredEventsList.innerHTML = '<p>No events registered yet.</p>';
        return;
    }

    userRegisteredEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
            <div class="card">
                <h3>${event.title}</h3>
                <p>${event.date} at ${event.location}</p>
                <button onclick="cancelRegistration(${event.id})">Cancel Registration</button>
            </div>
        `;
        registeredEventsList.appendChild(eventDiv);
    });
}

// Cancel Registration
function cancelRegistration(eventId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const registrations = JSON.parse(localStorage.getItem(USER_REGISTRATIONS_KEY));

    const userRegisteredEvents = registrations[currentUser.username] || [];
    const updatedRegisteredEvents = userRegisteredEvents.filter(event => event.id !== eventId);
    registrations[currentUser.username] = updatedRegisteredEvents;
    localStorage.setItem(USER_REGISTRATIONS_KEY, JSON.stringify(registrations));

    alert('Registration canceled successfully!');
    renderRegisteredEvents();  // Refresh the registered events list
}

// Check for Current User
function checkCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        renderDashboard(currentUser.role);
    } else {
        showLoginContainer();
    }
}

// Show Login Container
function showLoginContainer() {
    hideAllContainers();
    document.getElementById('login-container').classList.remove('hidden');
}

// Show Register Container
function showRegisterContainer() {
    hideAllContainers();
    document.getElementById('register-container').classList.remove('hidden');
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    showLoginContainer();
}
