let submissions = [];

async function loadSubmissions() {
    try {
        const response = await fetch('/api/submissions');
        submissions = await response.json();
        
        document.getElementById('loading').classList.add('hidden');
        
        if (submissions.length === 0) {
            document.getElementById('noSubmissions').classList.remove('hidden');
        } else {
            document.getElementById('submissionsContainer').classList.remove('hidden');
            renderSubmissions();
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('loading').innerHTML = '<p class="text-red-600">Error loading submissions</p>';
    }
}

function renderSubmissions() {
    const container = document.getElementById('submissionsList');
    container.innerHTML = '';
    
    submissions.forEach((submission, index) => {
        const submissionCard = document.createElement('div');
        submissionCard.className = 'submission-card rounded-lg p-4 border border-gray-200';
        
        submissionCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 flex-1">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium truncate" style="color: #11336e;">${submission.employeeName}</h3>
                        <p class="text-sm text-gray-500">${submission.department} • ${submission.staffId}</p>
                    </div>
                    <div class="flex-shrink-0">
                        <img src="${submission.signatureData}" alt="Signature" class="w-20 h-12 object-contain border rounded bg-gray-50 cursor-pointer" onclick="viewSignature('${submission.signatureData}')">
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(submissionCard);
    });
}

function viewSignature(signatureData) {
    const modal = document.getElementById('signatureModal');
    const image = document.getElementById('signatureImage');
    
    image.src = signatureData;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

document.getElementById('closeSignatureModal').addEventListener('click', () => {
    const modal = document.getElementById('signatureModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});

document.getElementById('exportPrint').addEventListener('click', () => {
    window.open('/api/export-html', '_blank');
});

document.getElementById('exportExcel').addEventListener('click', () => {
    window.open('/api/export-excel', '_blank');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('signatureModal');
    if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
});

loadSubmissions();
