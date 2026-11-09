/* Admin Panel Functions */
function openAdminAuth() {
    const pass = prompt("অ্যাডমিন পাসওয়ার্ড দিন:");
    if (pass === "Stp26GR") {
        loadAdminBrandingInputs();
        renderAdminCategories();
        loadAdminPaymentInputs();
        renderAdminUsersList();
        renderAdminOrdersList();
        navTo('admin', true);
    } else if (pass !== null) alert("ভুল পাসওয়ার্ড!");
}

function switchAdminTab(tabName) {
    ['branding', 'products', 'payments', 'users', 'orders'].forEach(t => {
        const sec = document.getElementById(`admin-sec-${t}`);
        const tab = document.getElementById(`adm-tab-${t}`);
        if(sec) sec.classList.add('hidden');
        if(tab) tab.className = "flex-1 py-2.5 px-3 rounded-lg text-gray-600 hover:bg-gray-100 whitespace-nowrap";
    });
    const activeSec = document.getElementById(`admin-sec-${tabName}`);
    const activeTab = document.getElementById(`adm-tab-${tabName}`);
    if(activeSec) activeSec.classList.remove('hidden');
    if(activeTab) activeTab.className = "flex-1 py-2.5 px-3 rounded-lg bg-brand-500 text-white whitespace-nowrap";
    
    if(tabName === 'users') renderAdminUsersList();
    if(tabName === 'orders') renderAdminOrdersList();
    if(tabName === 'products') renderAdminCategories();
}

function loadAdminBrandingInputs() {
    const logoInput = document.getElementById('adm-branding-logo');
    const bannerInput = document.getElementById('adm-branding-banner');
    if(logoInput) logoInput.value = SiteBranding.logo || "";
    if(bannerInput) bannerInput.value = SiteBranding.banner || "";
}

function adminSaveBranding() {
    const logoInput = document.getElementById('adm-branding-logo');
    const bannerInput = document.getElementById('adm-branding-banner');
    if(logoInput) SiteBranding.logo = logoInput.value.trim();
    if(bannerInput) SiteBranding.banner = bannerInput.value.trim();
    saveStoreDataToCloud(); 
    applyBranding();
    showToast('সফল', 'ব্র্যান্ডিং সেভ হয়েছে!', 'success');
}

function loadAdminPaymentInputs() {
    const bkEl = document.getElementById('adm-pay-bkash');
    const ngEl = document.getElementById('adm-pay-nagad');
    const rkEl = document.getElementById('adm-pay-rocket');
    const upEl = document.getElementById('adm-pay-upay');
    if(bkEl) bkEl.value = PaymentNumbers.bKash || "";
    if(ngEl) ngEl.value = PaymentNumbers.Nagad || "";
    if(rkEl) rkEl.value = PaymentNumbers.Rocket || "";
    if(upEl) upEl.value = PaymentNumbers.Upay || "";
}

function adminSavePaymentNumbers() {
    const bkEl = document.getElementById('adm-pay-bkash');
    const ngEl = document.getElementById('adm-pay-nagad');
    const rkEl = document.getElementById('adm-pay-rocket');
    const upEl = document.getElementById('adm-pay-upay');
    if(bkEl) PaymentNumbers.bKash = bkEl.value.trim() || "01843800533";
    if(ngEl) PaymentNumbers.Nagad = ngEl.value.trim() || "01843800533";
    if(rkEl) PaymentNumbers.Rocket = rkEl.value.trim() || "01843800533";
    if(upEl) PaymentNumbers.Upay = upEl.value.trim() || "01843800533";
    saveStoreDataToCloud();
    showToast('সফল', 'পেমেন্ট নম্বর সেভ হয়েছে!', 'success');
}

function renderAdminUsersList() {
    const container = document.getElementById('adm-all-users-list');
    if(!container) return;
    container.innerHTML = '';
    
    let userKeys = Object.keys(usersStore);
    if (userKeys.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-500">কোনো ইউজার রেজিস্ট্রেশন করেনি।</p>`;
        return;
    }

    for (let email in usersStore) {
        const u = usersStore[email];
        const uOrders = ordersList.filter(o => o.userEmail && o.userEmail.toLowerCase() === email.toLowerCase());
        const uSpend = uOrders.reduce((sum, o) => sum + Number(o.price), 0);

        container.innerHTML += `
            <div class="bg-slate-50 p-3 rounded-xl border text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                    <strong>${u.name}</strong> (ID: <span class="font-mono">${u.userId}</span>)<br>
                    <span class="text-gray-500">${u.email}</span> | Orders: <strong>${uOrders.length}</strong> | Spend: <strong>৳${uSpend}</strong> | Bal: ৳${u.balance || 0}
                </div>
                <div class="flex items-center gap-2 ml-auto">
                    <button onclick="adminAddBal('${email}')" class="bg-blue-600 text-white px-2.5 py-1 rounded font-bold">+ Add Money</button>
                    <button onclick="adminToggleBlockUser('${email}')" class="${u.isBlocked ? 'bg-emerald-600' : 'bg-red-600'} text-white px-2.5 py-1 rounded font-bold">${u.isBlocked ? 'Unblock' : 'Block'}</button>
                </div>
            </div>`;
    }
}

function adminSearchUser() {
    const searchInputEl = document.getElementById('adm-user-search-input');
    const output = document.getElementById('adm-user-search-result');
    if(!searchInputEl || !output) return;

    const input = searchInputEl.value.trim().toLowerCase();
    let found = null;
    
    for (let email in usersStore) {
        const u = usersStore[email];
        if (u.email.toLowerCase() === input || (u.userId && u.userId.toLowerCase() === input)) { 
            found = u; 
            break; 
        }
    }

    if (!found) {
        output.classList.remove('hidden');
        output.innerHTML = `<p class="text-xs text-red-500 font-bold">ইউজার পাওয়া যায়নি!</p>`;
        return;
    }

    const uOrders = ordersList.filter(o => o.userEmail && o.userEmail.toLowerCase() === found.email.toLowerCase());
    const uSpend = uOrders.reduce((sum, o) => sum + Number(o.price), 0);
    output.classList.remove('hidden');
    output.innerHTML = `
        <div class="space-y-1 text-xs">
            <h4 class="font-bold text-gray-900">${found.name} (ID: ${found.userId})</h4>
            <p>Email: ${found.email}</p>
            <p>Total Orders: <strong>${uOrders.length}</strong></p>
            <p>Total Spend: <strong>৳${uSpend}</strong></p>
            <p>Balance: <strong class="text-brand-600">৳${found.balance || 0}</strong></p>
        </div>`;
}

function adminToggleBlockUser(email) {
    if(usersStore[email]) {
        usersStore[email].isBlocked = !usersStore[email].isBlocked;
        saveStoreDataToCloud(); 
        renderAdminUsersList();
        showToast('আপডেট', 'স্ট্যাটাস পরিবর্তিত হয়েছে', 'info');
    }
}

function adminAddBal(email) {
    const amt = prompt("টাকার পরিমাণ দিন:");
    if (amt && !isNaN(amt)) {
        if(usersStore[email]) {
            usersStore[email].balance = (Number(usersStore[email].balance) || 0) + Number(amt);
            if (currentUser && currentUser.email === email) currentUser.balance = usersStore[email].balance;
            saveStoreDataToCloud(); 
            renderAdminUsersList(); 
            checkProfileState();
            showToast('সফল', 'ব্যালেন্স যুক্ত হয়েছে', 'success');
        }
    }
}

function renderAdminOrdersList() {
    const container = document.getElementById('adm-all-orders-container');
    const searchInputEl = document.getElementById('adm-order-query-search');
    if(!container) return;

    const searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : "";
    let filtered = ordersList;

    if (searchQuery) {
        filtered = ordersList.filter(o => {
            const matchesSerial = o.serial && o.serial.toString() === searchQuery;
            const matchesUserID = o.userId && o.userId.toLowerCase() === searchQuery;
            const matchesEmail = o.userEmail && o.userEmail.toLowerCase().includes(searchQuery);
            return matchesSerial || matchesUserID || matchesEmail;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-xs text-red-500 font-bold">কোনো অর্ডার পাওয়া যায়নি!</p>`;
        return;
    }

    container.innerHTML = '';
    filtered.forEach(ord => {
        let badgeClass = ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : ord.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
        container.innerHTML += `
            <div class="bg-slate-50 p-3 rounded-xl border text-xs space-y-2">
                <div class="flex justify-between items-center font-bold text-gray-900">
                    <span>Order #${ord.serial} - ${ord.package} (৳${ord.price})</span>
                    <span class="text-gray-500 font-normal">${ord.date}</span>
                </div>
                <p class="text-gray-600">User ID: <strong class="text-brand-600 font-mono">${ord.userId || 'N/A'}</strong> (${ord.userEmail || ''}) | Player ID: <strong class="text-gray-900">${ord.playerId}</strong></p>
                <p class="text-gray-600">TrxID: <span class="font-mono">${ord.trxId}</span></p>
                <div class="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span class="font-bold text-gray-500">Status:</span>
                    <select onchange="adminUpdateOrderStatus(${ord.serial}, this.value)" class="px-2 py-1 rounded border text-xs font-bold ${badgeClass}">
                        <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ord.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>`;
    });
}

function adminUpdateOrderStatus(serial, newStatus) {
    const ord = ordersList.find(o => Number(o.serial) === Number(serial));
    if (ord) {
        ord.status = newStatus;
        saveStoreDataToCloud(); 
        renderAdminOrdersList();
        showToast('সফল', `অর্ডার #${serial} স্ট্যাটাস ${newStatus} করা হয়েছে।`, 'success');
    }
}

function renderAdminCategories() {
    const container = document.getElementById('adm-categories-list');
    if(!container) return;
    container.innerHTML = '';
    for (let catKey in PackagesData) {
        const cat = PackagesData[catKey] || {};
        let pkgHtml = '';
        if (cat.packages) {
            cat.packages.forEach((p, idx) => {
                pkgHtml += `<div class="flex items-center gap-2 bg-white p-2 rounded border text-xs"><span class="flex-1 font-bold">${p.name} - ৳${p.price}</span><button onclick="adminDeletePkg('${catKey}', ${idx})" class="text-red-500 font-bold px-2">X</button></div>`;
            });
        }
        container.innerHTML += `
            <div class="bg-slate-50 p-4 rounded-xl border space-y-3">
                <div class="flex justify-between items-center">
                    <strong class="text-sm font-bold text-gray-900">${catKey}</strong>
                    <button onclick="adminDeleteCat('${catKey}')" class="bg-red-500 text-white text-[10px] px-2.5 py-1 rounded font-bold">Delete Category</button>
                </div>
                <div class="space-y-1">
                    <label class="block text-[11px] font-bold text-gray-700">নিয়মাবলী ও শর্তসমূহ (Rules)</label>
                    <textarea id="adm-rules-${CSS.escape(catKey)}" rows="3" class="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none">${cat.rules || ''}</textarea>
                    <button onclick="adminSaveCategoryRules('${catKey}')" class="bg-brand-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold mt-1">নিয়ম সেভ করুন</button>
                </div>
                <div class="space-y-2 pt-2 border-t border-gray-200">
                    <span class="text-xs font-bold text-gray-700 block">প্যাকেজসমূহ:</span>
                    ${pkgHtml}
                    <button onclick="adminAddPkg('${catKey}')" class="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold mt-1">+ Package</button>
                </div>
            </div>`;
    }
}

function adminSaveCategoryRules(catKey) {
    const textarea = document.getElementById(`adm-rules-${CSS.escape(catKey)}`);
    if (textarea && PackagesData[catKey]) {
        PackagesData[catKey].rules = textarea.value;
        saveStoreDataToCloud();
        renderHomeCategories();
        showToast('সফল', `${catKey} ক্যাটাগরির নিয়মাবলী আপডেট করা হয়েছে!`, 'success');
    }
}

function adminAddCategory() {
    const nameEl = document.getElementById('adm-cat-name');
    const imgEl = document.getElementById('adm-cat-img');
    const typeEl = document.getElementById('adm-cat-type');
    if(!nameEl || !typeEl) return;

    const name = nameEl.value.trim();
    const img = imgEl ? imgEl.value.trim() : "";
    const type = typeEl.value;

    if(!name) return;
    PackagesData[name] = { type: type, img: img || "https://i.ibb.co.com/v4fLwZG1/logo.png", rules: "নিয়মাবলী এখানে লিখুন...", packages: [] };
    saveStoreDataToCloud(); 
    renderHomeCategories(); 
    renderAdminCategories();
    nameEl.value = '';
    if(imgEl) imgEl.value = '';
    showToast('সফল', 'ক্যাটাগরি তৈরি হয়েছে!', 'success');
}

function adminDeleteCat(key) { 
    delete PackagesData[key]; 
    saveStoreDataToCloud(); 
    renderHomeCategories(); 
    renderAdminCategories(); 
}

function adminAddPkg(catKey) {
    const name = prompt("প্যাকেজের নাম:");
    const price = prompt("দাম (TK):");
    if(name && price) { 
        if(!PackagesData[catKey].packages) PackagesData[catKey].packages = [];
        PackagesData[catKey].packages.push({ name: name, price: Number(price) }); 
        saveStoreDataToCloud(); 
        renderHomeCategories();
        renderAdminCategories(); 
    }
}

function adminDeletePkg(catKey, idx) { 
    if(PackagesData[catKey] && PackagesData[catKey].packages) {
        PackagesData[catKey].packages.splice(idx, 1); 
        saveStoreDataToCloud();
        renderHomeCategories();
        renderAdminCategories(); 
    }
}
