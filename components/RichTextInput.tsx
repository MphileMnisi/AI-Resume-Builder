import React, { useRef, useCallback, useEffect } from 'react';

interface RichTextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextInput: React.FC<RichTextInputProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // This effect syncs the editor's content with the `value` prop
    // ONLY when the prop changes from an external source. It prevents
    // a feedback loop where user input would cause a re-render and lose focus.
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    // This callback reads from the DOM and tells the parent component about the change.
    const emitChange = useCallback(() => {
        if (editorRef.current) {
            const newHTML = editorRef.current.innerHTML;
            if (value !== newHTML) {
                onChange(newHTML);
            }
        }
    }, [onChange, value]);
    
    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
        emitChange();
    };

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            range.deleteContents(); 

            const br = document.createElement('br');
            range.insertNode(br);
            
            // After inserting the <br>, we must manually position the cursor after it.
            const newRange = document.createRange();
            newRange.setStartAfter(br);
            newRange.collapse(true);

            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Sync the state after our manual DOM change
            emitChange();
        }
    }, [emitChange]);

    const ToolbarButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ children, onClick, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus on button click
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
            aria-label={title}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <div className="flex items-center p-1 border-b border-slate-300 dark:border-slate-600 space-x-1 flex-wrap">
                <ToolbarButton onClick={() => handleFormat('bold')} title="Bold">
                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 4.25a.75.75 0 01.75-.75h5.5a3.5 3.5 0 010 7h-5.5a.75.75 0 010-1.5h5.5a2 2 0 100-4H4.25a.75.75 0 01-.75-.75zm.75 8a.75.75 0 000 1.5h6.5a3.5 3.5 0 000-7h-6.5a.75.75 0 000 1.5h6.5a2 2 0 110 4H4.25z" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleFormat('italic')} title="Italic">
                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M8.25 3.25a.75.75 0 01.75-.75h5.25a.75.75 0 010 1.5H13.5l-2.6 8.5h.9a.75.75 0 010 1.5H6.25a.75.75 0 010-1.5h.75l2.6-8.5H8.25a.75.75 0 01-.75-.75z" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleFormat('underline')} title="Underline">
                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M4.25 3.5c0-.966.784-1.75 1.75-1.75h8c.966 0 1.75.784 1.75 1.75v5.25a3.5 3.5 0 01-3.5 3.5H8.5a3.5 3.5 0 01-3.5-3.5V3.5zm1.75-.25a.25.25 0 00-.25.25v5.25c0 1.519 1.231 2.75 2.75 2.75h3a2.75 2.75 0 002.75-2.75V3.5a.25.25 0 00-.25-.25h-8zM4 16.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75a.75.75 0 01-.75-.75z" /></svg>
                </ToolbarButton>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <ToolbarButton onClick={() => handleFormat('insertUnorderedList')} title="Bulleted List">
                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.5 5.5A.5.5 0 013 5h14a.5.5 0 010 1H3a.5.5 0 01-.5-.5zM2 10a.5.5 0 01.5-.5h14a.5.5 0 010 1H2.5A.5.5 0 012 10zm.5 4.5a.5.5 0 000 1h14a.5.5 0 000-1H2.5z" clipRule="evenodd" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleFormat('insertOrderedList')} title="Numbered List">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.5a.5.5 0 01.783-.41l.512.327a.5.5 0 010 .82l-.512.327A.5.5 0 012 6.313V5.5zm3.5-.001a.5.5 0 01.5-.5h12a.5.5 0 010 1h-12a.5.5 0 01-.5-.5zM2 9.688a.5.5 0 01.5-.5h.005a.5.5 0 01.495.59l-.75 2.5a.5.5 0 01-.958-.28l.208-.691h-.001A.5.5 0 012 11.313V9.688zm3.5-.187a.5.5 0 01.5-.5h12a.5.5 0 010 1h-12a.5.5 0 01-.5-.5zM2.5 15a.5.5 0 01.5-.5h.001a.5.5 0 01.495.59l-.75 2.5a.5.5 0 01-.958-.28l.208-.691h-.001a.5.5 0 01-.494-1.09zm3.5-.001a.5.5 0 01.5-.5h12a.5.5 0 010 1h-12a.5.5 0 01-.5-.5z" /></svg>
                </ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={emitChange}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning={true}
                className="w-full p-2 min-h-[120px] focus:outline-none"
                data-placeholder={placeholder}
            />
        </div>
    );
};

export default RichTextInput;