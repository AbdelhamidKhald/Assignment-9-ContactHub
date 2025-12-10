var contacts = JSON.parse(localStorage.getItem('contacts')) || [];
var editId = null;
var bsModal = null;

var modal = document.getElementById('modal');
var addBtn = document.getElementById('addBtn');
var form = document.getElementById('form');
var modalTitle = document.getElementById('modalTitle');
var saveBtn = document.getElementById('saveBtn');
var searchInp = document.getElementById('searchInp');
var list = document.getElementById('list');
var empty = document.getElementById('empty');
var favList = document.getElementById('favList');
var emgList = document.getElementById('emgList');
var noFav = document.getElementById('noFav');
var noEmg = document.getElementById('noEmg');
var totalCount = document.getElementById('totalCount');
var favCount = document.getElementById('favCount');
var emgCount = document.getElementById('emgCount');
var contactsNum = document.getElementById('contactsNum');

var nameInp = document.getElementById('nameInp');
var phoneInp = document.getElementById('phoneInp');
var emailInp = document.getElementById('emailInp');
var addressInp = document.getElementById('addressInp');
var notesInp = document.getElementById('notesInp');
var favCheck = document.getElementById('favCheck');
var emgCheck = document.getElementById('emgCheck');

var nameErr = document.getElementById('nameErr');
var phoneErr = document.getElementById('phoneErr');
var emailErr = document.getElementById('emailErr');

bsModal = new bootstrap.Modal(modal);

nameInp.addEventListener('input', function() {
    validateName();
});

phoneInp.addEventListener('input', function() {
    validatePhone();
});

emailInp.addEventListener('input', function() {
    validateEmail();
});

addBtn.addEventListener('click', function() {
    editId = null;
    modalTitle.textContent = 'Add New Contact';
    saveBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Save Contact';
    clearForm();
    bsModal.show();
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    var nameValid = validateName();
    var phoneValid = validatePhone();
    var emailValid = validateEmail();
    
    if (!nameValid || !phoneValid || !emailValid) {
        Swal.fire('Error', 'Please fix the errors', 'error');
        return;
    }
    
    var contact = {
        id: editId || genId(),
        name: nameInp.value.trim(),
        phone: phoneInp.value.trim(),
        email: emailInp.value.trim(),
        address: addressInp.value.trim(),
        notes: notesInp.value.trim(),
        fav: favCheck.checked,
        emg: emgCheck.checked,
        createdAt: editId ? getContact(editId).createdAt : Date.now()
    };
    
    if (editId) {
        var idx = contacts.findIndex(function(c) { return c.id === editId; });
        contacts[idx] = contact;
        Swal.fire('Updated!', 'Contact updated successfully.', 'success');
    } else {
        contacts.push(contact);
        Swal.fire('Added!', 'Contact added successfully.', 'success');
    }
    
    save();
    render();
    bsModal.hide();
    clearForm();
});

searchInp.addEventListener('input', function() {
    render();
});

function validateName() {
    var name = nameInp.value.trim();
    var nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{2,}$/;
    
    nameErr.textContent = '';
    nameInp.classList.remove('is-invalid', 'is-valid');
    
    if (!name) {
        nameErr.textContent = 'Name is required';
        nameInp.classList.add('is-invalid');
        return false;
    } else if (!nameRegex.test(name)) {
        nameErr.textContent = 'Name must be 2+ letters only';
        nameInp.classList.add('is-invalid');
        return false;
    }
    
    nameInp.classList.add('is-valid');
    return true;
}

function validatePhone() {
    var phone = phoneInp.value.trim();
    var phoneRegex = /^(\+?20|0)?1[0125][0-9]{8}$/;
    
    phoneErr.textContent = '';
    phoneInp.classList.remove('is-invalid', 'is-valid');
    
    if (!phone) {
        phoneErr.textContent = 'Phone is required';
        phoneInp.classList.add('is-invalid');
        return false;
    } else if (!phoneRegex.test(phone)) {
        phoneErr.textContent = 'Please enter a valid Egyptian phone number';
        phoneInp.classList.add('is-invalid');
        return false;
    } else if (isDuplicate('phone', phone)) {
        phoneErr.textContent = 'Phone already exists';
        phoneInp.classList.add('is-invalid');
        return false;
    }
    
    phoneInp.classList.add('is-valid');
    return true;
}

function validateEmail() {
    var email = emailInp.value.trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    emailErr.textContent = '';
    emailInp.classList.remove('is-invalid', 'is-valid');
    
    if (!email) {
        emailErr.textContent = 'Email is required';
        emailInp.classList.add('is-invalid');
        return false;
    } else if (!emailRegex.test(email)) {
        emailErr.textContent = 'Please enter a valid email address';
        emailInp.classList.add('is-invalid');
        return false;
    } else if (isDuplicate('email', email)) {
        emailErr.textContent = 'Email already exists';
        emailInp.classList.add('is-invalid');
        return false;
    }
    
    emailInp.classList.add('is-valid');
    return true;
}

function isDuplicate(field, value) {
    return contacts.some(function(c) {
        if (editId && c.id === editId) return false;
        return c[field].toLowerCase() === value.toLowerCase();
    });
}

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getContact(id) {
    return contacts.find(function(c) { return c.id === id; });
}

function save() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function clearForm() {
    nameInp.value = '';
    phoneInp.value = '';
    emailInp.value = '';
    addressInp.value = '';
    notesInp.value = '';
    favCheck.checked = false;
    emgCheck.checked = false;
    nameErr.textContent = '';
    phoneErr.textContent = '';
    emailErr.textContent = '';
    nameInp.classList.remove('is-invalid', 'is-valid');
    phoneInp.classList.remove('is-invalid', 'is-valid');
    emailInp.classList.remove('is-invalid', 'is-valid');
    editId = null;
}

function getInitials(name) {
    var parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function render() {
    var query = searchInp.value.toLowerCase().trim();
    var filtered = contacts.filter(function(c) {
        return c.name.toLowerCase().includes(query) ||
               c.phone.includes(query) ||
               c.email.toLowerCase().includes(query);
    });
    
    list.innerHTML = '';
    
    if (filtered.length === 0) {
        empty.classList.remove('d-none');
    } else {
        empty.classList.add('d-none');
        filtered.forEach(function(c) {
            list.innerHTML += createCard(c);
        });
    }
    
    renderSidebar();
    updateCounts();
}


function createCard(c) {
    var html = '<div class="card border rounded-4 p-3 mb-3 contact-card">';
    html += '<div class="d-flex align-items-center gap-3 mb-3">';
    html += '<div class="card-avatar rounded-3 d-flex align-items-center justify-content-center text-white fw-bold">' + getInitials(c.name) + '</div>';
    html += '<h5 class="mb-0 fw-semibold">' + c.name + '</h5>';
    html += '</div>';
    html += '<div class="d-flex flex-column gap-2 mb-3">';
    html += '<div class="d-flex align-items-center gap-2"><span class="info-icon phone-bg rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-phone"></i></span><span>' + c.phone + '</span></div>';
    html += '<div class="d-flex align-items-center gap-2"><span class="info-icon email-bg rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-envelope"></i></span><span>' + c.email + '</span></div>';
    if (c.address) {
        html += '<div class="d-flex align-items-center gap-2"><span class="info-icon address-bg rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-location-dot"></i></span><span>' + c.address + '</span></div>';
    }
    html += '</div>';
    html += '<div class="d-flex gap-2 pt-3 border-top">';
    html += '<a href="tel:' + c.phone + '" class="btn action-btn call-btn rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-phone"></i></a>';
    html += '<a href="mailto:' + c.email + '" class="btn action-btn mail-btn rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-envelope"></i></a>';
    html += '<button class="btn action-btn fav-btn rounded-2 ' + (c.fav ? 'active' : '') + '" onclick="toggleFav(\'' + c.id + '\')"><i class="fa-solid fa-star"></i></button>';
    html += '<button class="btn action-btn edit-btn rounded-2" onclick="editContact(\'' + c.id + '\')"><i class="fa-solid fa-pen"></i></button>';
    html += '<button class="btn action-btn del-btn rounded-2" onclick="deleteContact(\'' + c.id + '\')"><i class="fa-solid fa-trash"></i></button>';
    html += '</div>';
    html += '</div>';
    return html;
}

function renderSidebar() {
    var favs = contacts.filter(function(c) { return c.fav; });
    var emgs = contacts.filter(function(c) { return c.emg; });
    
    favList.innerHTML = '';
    emgList.innerHTML = '';
    
    if (favs.length === 0) {
        noFav.classList.remove('d-none');
    } else {
        noFav.classList.add('d-none');
        favs.forEach(function(c) {
            favList.innerHTML += createSideItem(c);
        });
    }
    
    if (emgs.length === 0) {
        noEmg.classList.remove('d-none');
    } else {
        noEmg.classList.add('d-none');
        emgs.forEach(function(c) {
            emgList.innerHTML += createSideItem(c);
        });
    }
}

function createSideItem(c) {
    var html = '<div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light mb-2">';
    html += '<div class="d-flex align-items-center gap-2">';
    html += '<div class="side-avatar rounded-2 d-flex align-items-center justify-content-center text-white fw-semibold">' + getInitials(c.name) + '</div>';
    html += '<div><h6 class="mb-0 small fw-semibold">' + c.name + '</h6><small class="text-muted">' + c.phone + '</small></div>';
    html += '</div>';
    html += '<a href="tel:' + c.phone + '" class="btn side-call-btn rounded-2 d-flex align-items-center justify-content-center"><i class="fa-solid fa-phone small"></i></a>';
    html += '</div>';
    return html;
}

function updateCounts() {
    var favs = contacts.filter(function(c) { return c.fav; }).length;
    var emgs = contacts.filter(function(c) { return c.emg; }).length;
    
    totalCount.textContent = contacts.length;
    favCount.textContent = favs;
    emgCount.textContent = emgs;
    contactsNum.textContent = contacts.length;
}

function toggleFav(id) {
    var c = getContact(id);
    c.fav = !c.fav;
    save();
    render();
}

function editContact(id) {
    var c = getContact(id);
    editId = id;
    modalTitle.textContent = 'Edit Contact';
    saveBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Update Contact';
    
    nameInp.value = c.name;
    phoneInp.value = c.phone;
    emailInp.value = c.email;
    addressInp.value = c.address || '';
    notesInp.value = c.notes || '';
    favCheck.checked = c.fav;
    emgCheck.checked = c.emg;
    
    nameInp.classList.remove('is-invalid', 'is-valid');
    phoneInp.classList.remove('is-invalid', 'is-valid');
    emailInp.classList.remove('is-invalid', 'is-valid');
    nameErr.textContent = '';
    phoneErr.textContent = '';
    emailErr.textContent = '';
    
    bsModal.show();
}

function deleteContact(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c62828',
        cancelButtonColor: '#888',
        confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
        if (result.isConfirmed) {
            contacts = contacts.filter(function(c) { return c.id !== id; });
            save();
            render();
            Swal.fire('Deleted!', 'Contact has been deleted.', 'success');
        }
    });
}

render();
