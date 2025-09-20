import { getProvenance, queryAI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('provenanceForm');
    const batchIdInput = document.getElementById('batchId');
    const provenanceList = document.getElementById('provenanceList');
    
    // AI Section Elements
    const aiSection = document.getElementById('ai-section');
    const askBtn = document.getElementById('ask-ai-btn');
    const questionInput = document.getElementById('ai-question-input');
    const answerContainer = document.getElementById('ai-answer-container');
    const answerText = document.getElementById('ai-answer-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const batchId = batchIdInput.value;
        if (!batchId) {
            provenanceList.innerText = 'Please enter a Batch ID.';
            aiSection.style.display = 'none';
            return;
        }

        provenanceList.innerText = 'Fetching...';
        aiSection.style.display = 'none';

        try {
            const res = await getProvenance(batchId);
            provenanceList.innerText = JSON.stringify(res, null, 2);
            // Show the AI section now that we have data
            aiSection.style.display = 'block';
        } catch (error) {
            provenanceList.innerText = `Error: ${error.message}`;
        }
    });

    askBtn.addEventListener('click', async () => {
        const question = questionInput.value;
        const batchId = batchIdInput.value;

        if (!question) {
            alert('Please enter a question.');
            return;
        }
        if (!batchId) {
            alert('Please fetch a batch provenance first.');
            return;
        }

        answerText.textContent = 'Thinking...';
        answerContainer.style.display = 'block';
        askBtn.disabled = true;

        try {
            const result = await queryAI(question, batchId);
            answerText.textContent = result.answer;
        } catch (error) {
            answerText.textContent = `Error: ${error.message}`;
        } finally {
            askBtn.disabled = false;
        }
    });
});
