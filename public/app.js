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
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Network error. Please try again.');
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

document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});
