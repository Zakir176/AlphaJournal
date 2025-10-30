// Trading Journal logic: auto-date, image preview, localStorage CRUD

(function() {
    const STORAGE_KEY = 'journalEntries';

    const form = document.getElementById('entryForm');
    if (!form) return;

    const dateInput = document.getElementById('tradeDate');
    const amountInput = document.getElementById('pnl');
    const notesInput = document.getElementById('notes');
    const imageInput = document.getElementById('imageUpload');
    const entriesEl = document.getElementById('entries');

    // Prefill date to today
    dateInput.value = new Date().toISOString().slice(0, 10);

    // Image preview helper
    const previewEl = document.createElement('div');
    previewEl.className = 'preview';
    imageInput.insertAdjacentElement('afterend', previewEl);

    imageInput.addEventListener('change', () => {
        const file = imageInput.files && imageInput.files[0];
        if (!file) { previewEl.textContent = ''; previewEl.classList.remove('visible'); return; }
        const sizeKB = Math.round(file.size / 1024);
        previewEl.textContent = `Selected: ${file.name} (${sizeKB} KB)`;
        previewEl.classList.add('visible');
    });

    // Load entries
    function loadEntries() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }

    function saveEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function render(entries) {
        entriesEl.innerHTML = '';
        if (!entries.length) return;
        entries
            .slice()
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
            .forEach((entry, idx) => {
                const card = document.createElement('article');
                card.className = 'entry-card';

                const main = document.createElement('div');
                main.className = 'entry-main';

                const header = document.createElement('div');
                header.className = 'entry-header';

                const date = document.createElement('span');
                date.className = 'entry-date';
                date.textContent = entry.date || '';

                const amount = document.createElement('span');
                amount.className = 'entry-amount ' + (entry.amount >= 0 ? 'profit' : 'loss');
                amount.textContent = (entry.amount >= 0 ? '+' : '') + Number(entry.amount).toFixed(2);

                header.appendChild(date);
                header.appendChild(amount);

                const desc = document.createElement('p');
                desc.textContent = entry.desc || '';

                main.appendChild(header);
                main.appendChild(desc);

                if (entry.image) {
                    const img = document.createElement('img');
                    img.src = entry.image;
                    img.alt = 'Trade attachment';
                    img.className = 'entry-image';
                    main.appendChild(img);
                }

                const actions = document.createElement('div');
                actions.className = 'entry-actions';

                const editBtn = document.createElement('button');
                editBtn.className = 'btn';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', () => onEdit(idx));

                const delBtn = document.createElement('button');
                delBtn.className = 'btn danger';
                delBtn.textContent = 'Delete';
                delBtn.addEventListener('click', () => onDelete(idx));

                actions.appendChild(editBtn);
                actions.appendChild(delBtn);

                card.appendChild(main);
                card.appendChild(actions);
                entriesEl.appendChild(card);
            });
    }

    function onDelete(index) {
        const entries = loadEntries();
        entries.splice(index, 1);
        saveEntries(entries);
        render(entries);
    }

    function onEdit(index) {
        const entries = loadEntries();
        const e = entries[index];
        if (!e) return;
        dateInput.value = e.date || new Date().toISOString().slice(0, 10);
        amountInput.value = typeof e.amount === 'number' ? e.amount : '';
        notesInput.value = e.desc || '';
        // Keep image as-is unless a new file is chosen
        // Mark edit mode
        form.dataset.editIndex = String(index);
        form.querySelector('.cta').textContent = 'Update Entry';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const date = dateInput.value || new Date().toISOString().slice(0, 10);
        const amount = parseFloat(String(amountInput.value || '0'));
        const desc = notesInput.value.trim();

        // Prepare image if selected
        let imageData = '';
        const file = imageInput.files && imageInput.files[0];
        if (file) {
            try { imageData = await toBase64(file); } catch (_) { imageData = ''; }
        }

        const entries = loadEntries();
        const payload = { date, desc, amount: isNaN(amount) ? 0 : amount, image: imageData };

        if (form.dataset.editIndex) {
            const i = parseInt(form.dataset.editIndex, 10);
            // Preserve previous image if new one not selected
            if (!imageData && entries[i] && entries[i].image) payload.image = entries[i].image;
            entries[i] = payload;
            delete form.dataset.editIndex;
            form.querySelector('.cta').textContent = 'Add Entry';
        } else {
            entries.push(payload);
        }

        saveEntries(entries);
        render(entries);
        form.reset();
        dateInput.value = new Date().toISOString().slice(0, 10);
        previewEl.textContent = '';
        previewEl.classList.remove('visible');
    }

    form.addEventListener('submit', handleSubmit);

    // Initial render
    render(loadEntries());
})();


