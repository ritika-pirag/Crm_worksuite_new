import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['image', 'link'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'image', 'link',
    'color', 'background',
    'list', 'bullet',
    'indent'
];

/**
 * RichTextEditor Component
 * A reusable rich text editor powered by ReactQuill
 */
const RichTextEditor = ({ value, onChange, placeholder, className = '' }) => {

    return (
        <div className={`rich-text-editor-container ${className}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-lg"
            />
            <style>{`
        .rich-text-editor-container .ql-toolbar.ql-snow {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #d1d5db;
          background-color: #f9fafb;
        }
        .rich-text-editor-container .ql-container.ql-snow {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #d1d5db;
          min-height: 150px;
          font-family: inherit;
        }
        .rich-text-editor-container .ql-editor {
          min-height: 150px;
          font-size: 0.875rem;
        }
        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
        </div>
    );
};

export default RichTextEditor;
