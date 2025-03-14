import { labelContent } from '../../content/descriptions.js';

export class LabelModal {
    constructor() {
        this.createModalElement();
        this.setupEventListeners();
    }

    createModalElement() {
        // Create modal overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'label-modal-overlay';

        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'label-modal';

        // Create header
        const header = document.createElement('div');
        header.className = 'label-modal-header';

        this.title = document.createElement('h2');
        this.title.className = 'label-modal-title';

        const closeButton = document.createElement('button');
        closeButton.className = 'label-modal-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.hide();

        header.appendChild(this.title);
        header.appendChild(closeButton);

        // Create content container
        const content = document.createElement('div');
        content.className = 'label-modal-content';

        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'label-modal-video-container';

        this.video = document.createElement('video');
        this.video.className = 'label-modal-video';
        this.video.controls = true;
        this.video.playsInline = true;

        videoContainer.appendChild(this.video);

        // Create text container
        this.textContainer = document.createElement('div');
        this.textContainer.className = 'label-modal-text';

        // Assemble modal
        content.appendChild(videoContainer);
        content.appendChild(this.textContainer);

        this.modal.appendChild(header);
        this.modal.appendChild(content);

        this.overlay.appendChild(this.modal);

        // Add to document
        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        // Close modal when clicking overlay (outside modal)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.hide();
            }
        });
    }

    show(labelId) {
        const content = labelContent[labelId];
        if (!content) {
            console.error(`No content found for label: ${labelId}`);
            return;
        }

        // Update content
        this.title.textContent = content.title;
        this.textContainer.innerHTML = content.description.replace(/\n\s+/g, '<br><br>');

        // Update and play video
        this.video.src = content.videoSrc;
        this.video.load();
        
        // Show modal
        this.overlay.classList.add('active');
        
        // Start playing video
        this.video.play().catch(error => {
            console.warn('Auto-play failed:', error);
        });
    }

    hide() {
        // Pause and reset video
        this.video.pause();
        this.video.currentTime = 0;
        
        // Hide modal
        this.overlay.classList.remove('active');
    }
} 