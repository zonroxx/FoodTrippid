// ===== BAG STATE (localStorage) =====
function loadBag() {
  try { return JSON.parse(localStorage.getItem('ftph_bag') || '[]'); } catch { return []; }
}
function saveBag(items) {
  localStorage.setItem('ftph_bag', JSON.stringify(items));
}
function getBagCount() {
  return loadBag().reduce((sum, i) => sum + i.count, 0);
}

// ===== BADGE UPDATE =====
function updateAllBadges() {
  const count = getBagCount();
  // Bottom nav badge
  const nb = document.getElementById('nav-bag-badge');
  if (nb) { nb.classList.toggle('show', count > 0); nb.textContent = count; }
  // Sidebar badge
  const sb = document.getElementById('sidebar-bag-badge');
  if (sb) { sb.classList.toggle('show', count > 0); sb.textContent = count; }
  // Bag page count header
  const bc = document.getElementById('bag-count');
  if (bc) bc.textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

// ===== ADD TO BAG (card button) =====
function addToBag(event, label) {
  event.stopPropagation();
  const items = loadBag();
  const name = event.currentTarget.dataset.name || 'Item';
  const price = event.currentTarget.dataset.price || '₱0';
  const seller = event.currentTarget.dataset.seller || '';
  const existing = items.find(i => i.name === name);
  if (existing) existing.count++;
  else items.push({ name, price, seller, count: 1 });
  saveBag(items);
  updateAllBadges();
  showToast(label === 'Reserved' ? '<i class="fa fa-check mr-1"></i> Item reserved!' : '<i class="fa fa-check mr-1"></i> Added to basket!');
}

// ===== ADD TO BAG (from modal) =====
function addToBagModal(name, price, seller) {
  const qty = parseInt(document.getElementById('modal-qty')?.textContent || 1);
  const items = loadBag();
  const existing = items.find(i => i.name === name);
  if (existing) existing.count += qty;
  else items.push({ name, price, seller, count: qty });
  saveBag(items);
  updateAllBadges();
  const isFree = price === 'FREE';
  showToast(isFree ? `<i class="fa fa-check mr-1"></i> ${qty}x reserved for FREE!` : `<i class="fa fa-check mr-1"></i> ${qty}x added to basket!`);
}

// ===== REMOVE FROM BAG =====
function removeFromBag(name) {
  const items = loadBag().filter(i => i.name !== name);
  saveBag(items);
  updateAllBadges();
  if (typeof renderBag === 'function') renderBag();
}

// ===== MODAL =====
function openModal(name, seller, price, origPrice, cat, expiry, tag, imgClass, desc, dist, rating) {
  document.getElementById('modal-title').textContent = name;
  const isFree = price === 'FREE';
  const discount = !isFree ? Math.round((1 - parseInt(price.replace('₱','')) / parseInt(origPrice.replace('₱',''))) * 100) : 0;
  document.getElementById('modal-body').innerHTML = `
    <div class="h-44 rounded-2xl mb-4 relative flex items-end p-3 overflow-hidden">
      <img src="images/placeholderFood.png" class="absolute inset-0 w-full h-full object-cover rounded-2xl" alt="food">
      <div class="hero-overlay absolute inset-0 rounded-2xl"></div>
      <div class="relative z-10 flex gap-2 flex-wrap">
        <span class="${isFree ? 'tag-free' : 'tag-expiry'} text-xs px-2 py-0.5 rounded-full">
          <i class="fa fa-clock mr-1"></i>Exp: ${expiry}
        </span>
        <span class="tag-new text-xs px-2 py-0.5 rounded-full">${tag}</span>
      </div>
    </div>
    <div class="mb-3">
      <p class="text-xs text-textSecondary"><i class="fa fa-store mr-1"></i>${seller}</p>
      <p class="text-xs text-textSecondary mt-0.5"><i class="fa fa-location-dot mr-1"></i>${dist} &nbsp;<span class="star">${rating}</span></p>
    </div>
    <p class="text-sm text-textSecondary leading-relaxed mb-4">${desc}</p>
    <div class="flex items-center justify-between bg-card rounded-2xl p-3 border border-border mb-4">
      <div>
        <p class="text-xs text-textSecondary mb-0.5">Price</p>
        <div class="flex items-baseline gap-2">
          <span class="${isFree ? 'text-green-400' : 'text-brand'} font-display font-bold text-2xl">${price}</span>
          ${!isFree ? `<span class="price-original text-sm">${origPrice}</span>` : ''}
          ${!isFree ? `<span class="bg-brand/20 text-brand text-xs px-1.5 py-0.5 rounded-full">${discount}% off</span>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="qty-btn" onclick="changeQty(-1)"><i class="fa fa-minus text-xs text-textSecondary"></i></button>
        <span id="modal-qty" class="font-display font-bold text-textPrimary w-4 text-center">1</span>
        <button class="qty-btn" onclick="changeQty(1)"><i class="fa fa-plus text-xs text-textSecondary"></i></button>
      </div>
    </div>
    <button onclick="addToBagModal('${name.replace(/'/g,"\\'")}','${price}','${seller.replace(/'/g,"\\'")}');closeModalBtn()"
      class="${isFree ? 'bg-green-900/50 border border-green-700/50 text-green-400 hover:bg-green-800/50' : 'btn-primary text-white'} w-full py-4 rounded-2xl font-display font-bold text-sm transition-colors">
      ${isFree ? '<i class="fa fa-handshake mr-2"></i>Reserve for FREE' : '<i class="fa fa-bag-shopping mr-2"></i>Add to Basket'}
    </button>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}
function closeModalBtn() {
  document.getElementById('modal-overlay').classList.remove('show');
}
function changeQty(delta) {
  const el = document.getElementById('modal-qty');
  if (!el) return;
  let v = parseInt(el.textContent) + delta;
  if (v < 1) v = 1; if (v > 10) v = 10;
  el.textContent = v;
}

// ===== DONATE MODAL =====
function showDonateModal() { document.getElementById('donate-modal').classList.add('show'); }
function closeDonateModal(e) {
  if (!e || e.target === document.getElementById('donate-modal'))
    document.getElementById('donate-modal').classList.remove('show');
}

// ===== BOOKMARK =====
function toggleBookmark(btn, event) {
  if (event) event.stopPropagation();
  const icon = btn.querySelector('i') || btn;
  if (btn.classList.contains('bookmarked')) {
    btn.classList.remove('bookmarked');
    icon.style.color = '';
    showToast('<i class="fa fa-bookmark mr-1"></i> Removed from saved');
  } else {
    btn.classList.add('bookmarked');
    icon.style.color = '#FF6B00';
    showToast('<i class="fa fa-bookmark mr-1"></i> Saved to bookmarks!');
  }
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== NAV INIT =====
function initNav(activePage) {
  // Bottom nav
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activePage);
  });
  // Sidebar
  document.querySelectorAll('.sidebar-nav-link[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activePage);
  });
  updateAllBadges();
}

// ===== CATEGORY FILTER =====
function filterCat(btn, cat) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  showToast(`<i class="fa fa-filter mr-1"></i> Filtered: ${btn.dataset.label || cat}`);
}

// ===== FILTER CHIP =====
function toggleFilter(btn) { btn.classList.toggle('active'); }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', updateAllBadges);
