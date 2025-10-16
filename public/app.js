document.getElementById('petitionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employeeName = formData.get('employeeName');
    const department = formData.get('department');
    const staffId = formData.get('staffId');
    
    if (signatureCanvas.isEmpty()) {
        alert('Please provide your signature before submitting.');
        return;
    }
    
    const signatureData = signatureCanvas.getSignatureData();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employeeName,
                department,
                staffId,
                signatureData
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessModal();
            e.target.reset();
            signatureCanvas.clear();
        } else {
            // Handle different types of errors with proper modals
            if (response.status === 409) {
                showErrorModal('Duplicate Submission', result.error);
            } else {
                showErrorModal('Submission Error', result.error);
            }
        }
    } catch (error) {
        showErrorModal('Network Error', 'Unable to connect to server. Please check your connection and try again.');
        console.error('Error:', error);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function showErrorModal(title, message) {
    const modal = document.getElementById('errorModal');
    const titleElement = document.getElementById('errorTitle');
    const messageElement = document.getElementById('errorMessage');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});

document.getElementById('closeErrorModal').addEventListener('click', () => {
    const modal = document.getElementById('errorModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    
    if (e.target === successModal) {
        successModal.classList.add('hidden');
        successModal.classList.remove('flex');
    }
    
    if (e.target === errorModal) {
        errorModal.classList.add('hidden');
        errorModal.classList.remove('flex');
    }
});
