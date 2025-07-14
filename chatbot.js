class VapiChatbot {
    constructor() {
        this.apiEndpoint = 'https://api.vapi.ai/chat';
        this.apiKey = '9cc8482d-045b-480d-b3e0-c78a64630d50';
        this.assistantId = '05b294eb-7487-4d5a-866a-9e94a7181687';
        
        this.isTyping = false;
        this.messageHistory = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeChat();
    }
    
    initializeElements() {
        // Core chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.charCount = document.getElementById('charCount');
        
        // Status and control elements
        this.connectionStatus = document.getElementById('connectionStatus');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryButton = document.getElementById('retryButton');
        this.clearButton = document.getElementById('clearChat');
        this.minimizeButton = document.getElementById('minimizeChat');
        
        // Validate required elements
        if (!this.chatMessages || !this.messageInput || !this.sendButton) {
            console.error('Required chat elements not found');
            this.showError('Chat interface failed to load properly');
            return;
        }
    }
    
    setupEventListeners() {
        // Message input events
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.messageInput.addEventListener('paste', () => {
            setTimeout(() => this.handleInputChange(), 10);
        });
        
        // Send button
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Control buttons
        this.clearButton?.addEventListener('click', () => this.clearChat());
        this.minimizeButton?.addEventListener('click', () => this.minimizeChat());
        this.retryButton?.addEventListener('click', () => this.retryLastMessage());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // Focus management
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.messageInput.focus();
            }
        });
    }
    
    initializeChat() {
        // Focus on input
        this.messageInput.focus();
        
        // Update connection status
        this.updateConnectionStatus('connected');
        
        // Load any saved chat history (optional)
        this.loadChatHistory();
        
        console.log('🤖 MindSage Chatbot initialized successfully');
    }
    
    handleInputChange() {
        const text = this.messageInput.value.trim();
        const charLength = this.messageInput.value.length;
        
        // Update character count
        this.charCount.textContent = charLength;
        
        // Update send button state
        this.sendButton.disabled = text.length === 0 || this.isTyping;
        
        // Update button appearance
        if (text.length > 0 && !this.isTyping) {
            this.sendButton.classList.add('active');
        } else {
            this.sendButton.classList.remove('active');
        }
        
        // Character limit warning
        if (charLength > 1800) {
            this.charCount.style.color = '#ff6b6b';
        } else {
            this.charCount.style.color = '';
        }
    }
    
    handleKeyDown(e) {
        // Send on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendButton.disabled) {
                this.sendMessage();
            }
        }
    }
    
    autoResizeTextarea() {
        const textarea = this.messageInput;
        const maxHeight = 120; // Maximum height in pixels
        
        // Reset height to calculate scroll height
        textarea.style.height = 'auto';
        
        // Set new height based on content
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = newHeight + 'px';
        
        // Add scrollbar if content exceeds max height
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
    }
    
    async sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (!text || this.isTyping) return;
        
        // Clear input immediately
        this.messageInput.value = '';
        this.handleInputChange();
        this.autoResizeTextarea();
        
        // Add user message to chat
        this.addMessage(text, 'user');
        
        // Store message for potential retry
        this.lastUserMessage = text;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to Vapi API
            const response = await this.callVapiAPI(text);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add assistant response
            if (response && response.output && response.output[0] && response.output[0].content) {
                this.addMessage(response.output[0].content, 'assistant');
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.showError('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        }
    }
    
    async callVapiAPI(message) {
        const requestBody = {
            assistantId: this.assistantId,
            input: message
        };
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    }
    
    addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const timestamp = this.formatTimestamp(new Date());
        
        if (sender === 'assistant') {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${this.formatMessageContent(content)}
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        ${this.formatMessageContent(content)}
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }
        
        // Add animation class
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        this.chatMessages.appendChild(messageElement);
        
        // Trigger animation
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
        // Store in history
        this.messageHistory.push({
            content,
            sender,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Save to localStorage (optional)
        this.saveChatHistory();
    }
    
    formatMessageContent(content) {
        // Basic HTML escape and formatting
        return content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    formatTimestamp(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins === 0) return 'Just now';
        if (diffMins === 1) return '1 minute ago';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
        this.sendButton.classList.remove('active');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.handleInputChange(); // Re-evaluate send button state
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    showError(message) {
        const errorElement = this.errorMessage;
        const errorText = errorElement.querySelector('.error-text');
        
        errorText.textContent = message;
        errorElement.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    retryLastMessage() {
        this.errorMessage.style.display = 'none';
        
        if (this.lastUserMessage) {
            this.messageInput.value = this.lastUserMessage;
            this.handleInputChange();
            this.messageInput.focus();
        }
    }
    
    clearChat() {
        if (confirm('هل أنت متأكد من حذف المحادثة؟ لن تتمكن من استرجاعها.')) {
            // Keep only welcome message
            const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
            this.chatMessages.innerHTML = '';
            if (welcomeMessage) {
                this.chatMessages.appendChild(welcomeMessage);
            }
            
            // Clear history
            this.messageHistory = [];
            this.lastUserMessage = null;
            
            // Clear localStorage
            localStorage.removeItem('mindsage_chat_history');
            
            // Focus input
            this.messageInput.focus();
        }
    }
    
    minimizeChat() {
        // This could integrate with a larger app layout
        console.log('Chat minimize requested');
    }
    
    updateConnectionStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${status}`;
            
            switch (status) {
                case 'connected':
                    statusText.textContent = 'Online • Ready to help';
                    break;
                case 'connecting':
                    statusText.textContent = 'Connecting...';
                    break;
                case 'disconnected':
                    statusText.textContent = 'Offline';
                    break;
            }
        }
    }
    
    saveChatHistory() {
        try {
            const historyToSave = this.messageHistory.slice(-50); // Keep last 50 messages
            localStorage.setItem('mindsage_chat_history', JSON.stringify(historyToSave));
        } catch (error) {
            console.warn('Could not save chat history:', error);
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('mindsage_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                // Optionally restore some recent messages
                // For now, we'll just keep it fresh each session
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the chatbot page
    if (document.getElementById('chatMessages')) {
        window.mindSageChatbot = new VapiChatbot();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.mindSageChatbot && !document.hidden) {
        window.mindSageChatbot.updateConnectionStatus('connected');
    }
});