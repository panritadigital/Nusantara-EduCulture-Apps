import React, { useState, useEffect, useRef, FormEvent, MouseEvent, useMemo } from 'react';
import { UserType, LearningMaterial, Assessment, StudentScore, AssessmentType, QuestionType, Question, Comment } from '../types';
import PPTViewer from './PPTViewer';
import { Header } from '../components/Header';
import AssessmentTaker from './AssessmentTaker';
import { ClockIcon, StarIcon, UsersIcon } from '../components/icons/SolidIcons';
import { StarIcon as OutlineStarIcon } from '../components/icons/OutlineIcons';

interface LuwuScreenProps {
  user: { type: UserType; name: string; schoolId: string };
  onBack: () => void;
  materials: LearningMaterial[];
  setAllMaterials: React.Dispatch<React.SetStateAction<LearningMaterial[]>>;
  assessments: Assessment[];
  setAllAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  studentScores: StudentScore[];
  setAllStudentScores: React.Dispatch<React.SetStateAction<StudentScore[]>>;
  onToggleFavorite: (materialId: string) => void;
}

const ImageEditorModal: React.FC<{
  imageElement: HTMLImageElement;
  onClose: () => void;
  onSave: () => void; // Parent will read styles directly from the element
}> = ({ imageElement, onClose, onSave }) => {
    const getInitialSize = () => {
        const wrapper = imageElement.parentElement;
        // Prefer width from wrapper if it's already been set
        if (wrapper && wrapper.style.width && wrapper.style.width.endsWith('%')) {
            return parseInt(wrapper.style.width, 10);
        }
        // Fallback to image width
        const initialWidth = parseInt(imageElement.style.width, 10) || imageElement.width;
        const editorWidth = wrapper?.parentElement?.clientWidth || 500;
        const calculatedSize = Math.round((initialWidth / editorWidth) * 100);
        return Math.max(10, Math.min(100, calculatedSize)); // clamp between 10 and 100
    };

    const [size, setSize] = useState(getInitialSize());

    // Effect to consistently apply size to wrapper and have image fill it
    useEffect(() => {
        const wrapper = imageElement.parentElement;
        if (wrapper && wrapper.classList.contains('aspect-ratio-wrapper')) {
            wrapper.style.width = `${size}%`;
            imageElement.style.width = '100%';
        }
    }, [size, imageElement]);


    const handleSizeChange = (newSize: number) => {
        setSize(newSize);
        // Also remove aspect ratio when freely resizing for better UX
        handleAspectRatio(null);
    };

    const handleAspectRatio = (ratio: string | null) => {
        const wrapper = imageElement.parentElement;
        if (wrapper && wrapper.classList.contains('aspect-ratio-wrapper')) {
            // Remove previous ratio classes
            wrapper.classList.remove('aspect-w-16', 'aspect-h-9', 'aspect-w-4', 'aspect-h-3', 'aspect-w-1', 'aspect-h-1');
            if (ratio) {
                const [w, h] = ratio.split(':');
                wrapper.classList.add(`aspect-w-${w}`, `aspect-h-${h}`);
                imageElement.style.height = '100%';
                // Use 'contain' to ensure the whole image is visible within the frame
                imageElement.style.objectFit = 'contain';
            } else { // Free aspect ratio
                imageElement.style.height = 'auto';
                imageElement.style.objectFit = 'initial';
            }
        } else if (ratio) {
            alert("Tidak bisa menerapkan rasio aspek pada gambar ini.");
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-brand-primary mb-4">Edit Gambar</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Perbesar/Perkecil Gambar</label>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="100" 
                                    value={size} 
                                    onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                />
                                <span className="text-sm font-semibold">{size}%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Bingkai (Aspek Rasio)</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <button onClick={() => handleAspectRatio(null)} className="px-3 py-1 text-sm bg-gray-200 rounded-md">Bebas</button>
                                <button onClick={() => handleAspectRatio('16:9')} className="px-3 py-1 text-sm bg-gray-200 rounded-md">16:9</button>
                                <button onClick={() => handleAspectRatio('4:3')} className="px-3 py-1 text-sm bg-gray-200 rounded-md">4:3</button>
                                <button onClick={() => handleAspectRatio('1:1')} className="px-3 py-1 text-sm bg-gray-200 rounded-md">1:1</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                        <button onClick={onSave} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Simpan</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MaterialEditorModal: React.FC<{
  initialData?: LearningMaterial | null;
  onClose: () => void;
  onSave: (material: Omit<LearningMaterial, 'id' | 'schoolId'> & { id?: string }) => void;
}> = ({ initialData, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState('Semua Kelas');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [graduateProfile, setGraduateProfile] = useState<string[]>([]);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [powerpointFile, setPowerpointFile] = useState<{ name: string; url: string } | null>(null);
  const [durationJP, setDurationJP] = useState<number>(2);
  const [videoFile, setVideoFile] = useState<{ name: string; url: string } | null>(null);
  
  const [imageToEdit, setImageToEdit] = useState<HTMLImageElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null); // For rich text editor
  const learningVideoInputRef = useRef<HTMLInputElement>(null); // For dedicated video upload
  const pptInputRef = useRef<HTMLInputElement>(null);
  
  const graduateProfilesOptions = [
      'Keimanan dan ketakwaan', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 
      'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
  ];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setThumbnailUrl(initialData.thumbnailUrl || null);
      setTargetClass(initialData.targetClass || 'Semua Kelas');
      setLearningObjectives(initialData.learningObjectives || '');
      setLearningGoals(initialData.learningGoals || '');
      setGraduateProfile(initialData.graduateProfile || []);
      setFontFamily(initialData.fontFamily || 'sans');
      setIsBold(initialData.isBold || false);
      setIsItalic(initialData.isItalic || false);
      setTextAlign(initialData.textAlign || 'left');
      setPowerpointFile(initialData.powerpoint || null);
      setDurationJP(initialData.durationJP || 2);
      if (initialData.videoUrl) {
          setVideoFile({ name: 'Video yang sudah diunggah', url: initialData.videoUrl });
      }
    }
  }, [initialData]);
  
  const isFormValid = title.trim() && learningObjectives.trim() && learningGoals.trim() && graduateProfile.length > 0 && (editorRef.current?.innerHTML.replace(/<[^>]*>/g, '').trim() || content.trim()) && powerpointFile && durationJP > 0;


  const handleProfileChange = (profile: string) => {
    setGraduateProfile(prev => 
        prev.includes(profile) 
            ? prev.filter(p => p !== profile) 
            : [...prev, profile]
    );
  };

  const handleSaveClick = () => {
    if (!isFormValid) {
      alert('Harap isi semua kolom yang ditandai dengan bintang (*).');
      return;
    }
    const finalContent = editorRef.current?.innerHTML || content;
    onSave({ id: initialData?.id, title, content: finalContent, thumbnailUrl, targetClass, learningObjectives, learningGoals, graduateProfile, fontFamily, isBold, isItalic, textAlign, powerpoint: powerpointFile!, durationJP, videoUrl: videoFile?.url });
  };
  
   const saveSelection = () => {
    if (document.activeElement === editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selectionRef.current = selection.getRangeAt(0);
      }
    }
  };

  const restoreSelection = () => {
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectionRef.current);
    } else {
      editorRef.current?.focus();
    }
  };

  const handleInsertMedia = (type: 'image' | 'video') => {
    saveSelection();
    if (type === 'image') imageInputRef.current?.click();
    else videoInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'image' && file.size > 10 * 1024 * 1024) { // 10 MB
        alert('Ukuran gambar tidak boleh melebihi 10 MB.');
        return;
    }
    if (type === 'video' && file.size > 1 * 1024 * 1024 * 1024) { // 1 GB
        alert('Ukuran video tidak boleh melebihi 1 GB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        let mediaHtml = '';
        if (type === 'image') {
            // Wrap image in a div for aspect ratio control
            mediaHtml = `
              <div class="aspect-ratio-wrapper my-2" style="display:inline-block; max-width: 100%; position: relative;">
                <img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer;" />
              </div>
            `;
        } else {
            mediaHtml = `<div class="my-2"><video controls src="${dataUrl}" style="max-width: 100%; border-radius: 8px;"></video></div>`;
        }
        
        restoreSelection();
        document.execCommand('insertHTML', false, mediaHtml);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleThumbnailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Ukuran gambar thumbnail tidak boleh melebihi 2MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const url = e.target?.result as string;
        setThumbnailUrl(url);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };
  
  const handleLearningVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10 MB limit
        alert("Ukuran video tidak boleh melebihi 10MB.");
        event.target.value = '';
        return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = function() {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 900) { // 15 minutes = 900 seconds
            alert("Durasi video tidak boleh melebihi 15 menit.");
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                setVideoFile({ name: file.name, url });
            };
            reader.readAsDataURL(file);
        }
    }
    videoElement.src = URL.createObjectURL(file);
    event.target.value = '';
  };

  const handlePptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPowerpointFile({ name: file.name, url });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }
  
  const handleEditorClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        setImageToEdit(e.target);
    }
  };
  
  const handleSaveImageEdit = () => {
      if (editorRef.current) {
          setContent(editorRef.current.innerHTML);
      }
      setImageToEdit(null);
  };

  const MenubarButton: React.FC<{onClick: () => void, children: React.ReactNode, isActive?: boolean}> = ({onClick, children, isActive}) => (
      <button type="button" onClick={onClick} className={`p-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200 text-brand-primary' : 'bg-gray-100'}`}>
        {children}
      </button>
  );
  
  const fontClasses = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono'
  };
  const editorClassName = `w-full px-3 py-2 h-32 min-h-[128px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-brand-secondary ${fontClasses[fontFamily]} ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} text-${textAlign}`;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <input type="file" ref={thumbnailInputRef} onChange={handleThumbnailFileChange} accept="image/*" className="hidden" />
          <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
          <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
          <input type="file" ref={learningVideoInputRef} onChange={handleLearningVideoFileChange} accept="video/*" className="hidden" />
          <input type="file" ref={pptInputRef} onChange={handlePptFileChange} accept=".ppt,.pptx,.pdf" className="hidden" />

          <h3 className="text-xl font-bold text-brand-primary mb-4">{initialData ? 'Edit Materi Ajar' : 'Tambah Materi Ajar Baru'}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Judul Materi<span className="text-red-500 ml-1">*</span></label>
              <input type="text" placeholder="Judul Materi" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md mt-1"/>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Gambar Thumbnail (Opsional)</label>
              <div className="mt-1 flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg">
                {!thumbnailUrl ? (
                    <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="bg-brand-secondary text-white px-4 py-2 text-sm rounded-md font-semibold">
                        Pilih Gambar
                    </button>
                ) : (
                    <div className="text-center">
                        <img src={thumbnailUrl} alt="Preview Thumbnail" className="w-48 h-auto max-h-48 object-contain rounded-md mb-3 mx-auto" />
                        <button type="button" onClick={() => setThumbnailUrl(null)} className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                            Hapus Gambar
                        </button>
                    </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Capaian Pembelajaran<span className="text-red-500 ml-1">*</span></label>
              <textarea placeholder="Capaian Pembelajaran..." value={learningObjectives} onChange={e => setLearningObjectives(e.target.value)} className="w-full px-3 py-2 border rounded-md h-24 mt-1"></textarea>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tujuan Pembelajaran<span className="text-red-500 ml-1">*</span></label>
              <textarea placeholder="Tujuan Pembelajaran..." value={learningGoals} onChange={e => setLearningGoals(e.target.value)} className="w-full px-3 py-2 border rounded-md h-24 mt-1"></textarea>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Profil Lulusan (Pilih yang relevan)<span className="text-red-500 ml-1">*</span></label>
              <div className="grid grid-cols-2 gap-2 mt-2 border p-3 rounded-md bg-gray-50">
                  {graduateProfilesOptions.map(profile => (
                      <label key={profile} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={graduateProfile.includes(profile)} 
                              onChange={() => handleProfileChange(profile)}
                              className="rounded text-brand-primary focus:ring-brand-secondary"
                          />
                          <span>{profile}</span>
                      </label>
                  ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Unggah Materi Presentasi (PDF/PPTX)<span className="text-red-500 ml-1">*</span></label>
              <div className="mt-1 flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg">
                <button onClick={() => pptInputRef.current?.click()} className="bg-brand-secondary text-white px-4 py-2 text-sm rounded-md font-semibold">Pilih File</button>
                {powerpointFile && (
                  <div className="mt-3 text-sm flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>{powerpointFile.name}</span>
                    <button onClick={() => setPowerpointFile(null)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
                  </div>
                )}
              </div>
            </div>
            
             <div>
              <label className="text-sm font-medium text-gray-700">Unggah Video Pembelajaran (Maks 10MB, 15 menit)</label>
              <div className="mt-1 flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg">
                <button onClick={() => learningVideoInputRef.current?.click()} className="bg-brand-secondary text-white px-4 py-2 text-sm rounded-md font-semibold">Pilih Video</button>
                {videoFile && (
                  <div className="mt-3 text-sm flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                    <span>{videoFile.name}</span>
                    <button onClick={() => setVideoFile(null)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
                  </div>
                )}
              </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">Konten Materi<span className="text-red-500 ml-1">*</span></label>
                <div className="border rounded-md mt-1">
                    <div className="p-1 flex items-center flex-wrap gap-1 bg-gray-50 rounded-t-md border-b">
                         <select value={fontFamily} onChange={e => setFontFamily(e.target.value as any)} className="text-sm p-2 border-none bg-gray-100 rounded hover:bg-gray-200 focus:ring-0">
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                         </select>
                         <div className="h-5 w-px bg-gray-300 mx-1"></div>
                         <MenubarButton onClick={() => setIsBold(!isBold)} isActive={isBold}><span className="font-bold w-5 h-5 flex items-center justify-center">B</span></MenubarButton>
                         <MenubarButton onClick={() => setIsItalic(!isItalic)} isActive={isItalic}><span className="italic font-bold w-5 h-5 flex items-center justify-center">I</span></MenubarButton>
                         <div className="h-5 w-px bg-gray-300 mx-1"></div>
                        <MenubarButton onClick={() => setTextAlign('left')} isActive={textAlign==='left'}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg></MenubarButton>
                        <MenubarButton onClick={() => setTextAlign('center')} isActive={textAlign==='center'}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg></MenubarButton>
                        <MenubarButton onClick={() => setTextAlign('right')} isActive={textAlign==='right'}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg></MenubarButton>
                         <div className="h-5 w-px bg-gray-300 mx-1"></div>
                        <MenubarButton onClick={() => alert('Fitur ini akan menambahkan nomor.')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M6 6.5h0M6 12.5h0M6 18.5h0" /></svg></MenubarButton>
                        <MenubarButton onClick={() => alert('Fitur ini akan menambahkan bullet.')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg></MenubarButton>
                         <div className="h-5 w-px bg-gray-300 mx-1"></div>
                        <MenubarButton onClick={() => handleInsertMedia('image')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg></MenubarButton>
                        <MenubarButton onClick={() => handleInsertMedia('video')}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></MenubarButton>
                    </div>
                    <div className="relative">
                      <div
                        ref={editorRef}
                        contentEditable="true"
                        onBlur={saveSelection}
                        onClick={handleEditorClick}
                        onInput={(e: FormEvent<HTMLDivElement>) => setContent(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: content }}
                        className={editorClassName}
                      ></div>
                      {!content.replace(/<[^>]*>/g, '').trim() && (
                          <div 
                              className={`absolute top-0 left-0 px-3 py-2 text-gray-400 pointer-events-none ${fontClasses[fontFamily]} ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} text-${textAlign}`}
                          >
                              Konten Materi...
                          </div>
                      )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Jumlah Jam Pelajaran (JP)<span className="text-red-500 ml-1">*</span></label>
                <input type="number" min="1" value={durationJP} onChange={e => setDurationJP(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 border rounded-md"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tujukan untuk Kelas<span className="text-red-500 ml-1">*</span></label>
                <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md bg-white">
                  <option>Semua Kelas</option>
                  <option>Kelas 7A</option>
                  <option>Kelas 7B</option>
                  <option>Kelas 8A</option>
                  <option>Kelas 8B</option>
                </select>
              </div>
            </div>

          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
            <button disabled={!isFormValid} onClick={handleSaveClick} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Simpan Materi</button>
          </div>
        </div>
      </div>
    </div>
    {imageToEdit && <ImageEditorModal imageElement={imageToEdit} onClose={() => setImageToEdit(null)} onSave={handleSaveImageEdit} />}
    </>
  );
};

const MaterialDetailModal: React.FC<{
  material: LearningMaterial;
  user: { type: UserType; name: string; schoolId: string };
  onClose: () => void;
  onEdit: (material: LearningMaterial) => void;
  onViewPPT: (ppt: { name: string; url: string; }) => void;
  onAddComment: (materialId: string, content: string) => void;
  onDeleteComment: (materialId: string, commentId: string) => void;
}> = ({ material, user, onClose, onEdit, onViewPPT, onAddComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const canManage = user.type === UserType.Guru || user.type === UserType.Admin;

  const handleCommentSubmit = () => {
    onAddComment(material.id, newComment);
    setNewComment('');
  };

  const fontClasses = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono'
  };

  const contentClassName = `text-base text-gray-700 leading-relaxed break-words
    ${material.fontFamily ? fontClasses[material.fontFamily] : 'font-sans'}
    ${material.isBold ? 'font-bold' : ''}
    ${material.isItalic ? 'italic' : ''}
    ${material.textAlign ? `text-${material.textAlign}` : 'text-left'}
  `;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-brand-primary">{material.title}</h3>
            {material.targetClass && <span className="text-sm flex-shrink-0 bg-brand-accent text-brand-primary font-semibold px-3 py-1 rounded-full ml-4">{material.targetClass}</span>}
          </div>
          
          {material.powerpoint && (
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center space-y-3">
                <svg className="w-16 h-16 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm3 1a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                <p className="font-semibold text-brand-primary">Materi Presentasi</p>
                <p className="text-sm text-gray-600">{material.powerpoint.name}</p>
                <button 
                    onClick={() => {
                        if (material.powerpoint) {
                            onViewPPT(material.powerpoint);
                        }
                    }}
                    className="w-full bg-red-700 text-white py-2 rounded-md font-semibold hover:bg-red-800 transition-colors"
                >
                    Lihat Presentasi
                </button>
            </div>
          )}

          <div className={`${contentClassName} prose max-w-none`} dangerouslySetInnerHTML={{ __html: material.content }} />
          
          {material.videoUrl && (
            <div className="my-4">
              <h4 className="font-semibold text-brand-primary mb-2">Video Pembelajaran</h4>
              <video controls src={material.videoUrl} className="w-full rounded-lg bg-black">
                Browser Anda tidak mendukung tag video.
              </video>
            </div>
          )}

          {material.learningObjectives && (
            <div className="border-t pt-3 mt-3">
                <h4 className="font-semibold text-brand-primary mb-1">Capaian Pembelajaran</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{material.learningObjectives}</p>
            </div>
          )}
          {material.learningGoals && (
            <div className="border-t pt-3 mt-3">
                <h4 className="font-semibold text-brand-primary mb-1">Tujuan Pembelajaran</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{material.learningGoals}</p>
            </div>
          )}
          {material.graduateProfile && material.graduateProfile.length > 0 && (
            <div className="border-t pt-3 mt-3">
                <h4 className="font-semibold text-brand-primary mb-2">Profil Lulusan</h4>
                <div className="flex flex-wrap gap-2">
                    {material.graduateProfile.map(profile => (
                        <span key={profile} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{profile}</span>
                    ))}
                </div>
            </div>
          )}

           <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-brand-primary mb-3 text-lg">Diskusi & Komentar</h4>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 mb-4 bg-gray-50 p-3 rounded-md">
                  {(material.comments || []).length > 0 ? (
                      material.comments?.map(comment => (
                          <div key={comment.id} className="flex space-x-3">
                              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${comment.userType === UserType.Guru ? 'bg-brand-primary' : (comment.userType === UserType.Admin ? 'bg-purple-600' : 'bg-brand-secondary')}`}>
                                  {comment.author.charAt(0)}
                              </div>
                              <div className="flex-grow">
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <span className="font-semibold text-sm">{comment.author}</span>
                                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize ${comment.userType === UserType.Guru ? 'bg-blue-100 text-blue-800' : (comment.userType === UserType.Admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800')}`}>
                                              {comment.userType}
                                          </span>
                                      </div>
                                      {canManage && (
                                          <button onClick={() => onDeleteComment(material.id, comment.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                                              Hapus
                                          </button>
                                      )}
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(comment.timestamp)}
                                  </p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
                  )}
              </div>
              <div className="mt-4">
                  <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis komentar Anda..."
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                      rows={2}
                  />
                  <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="mt-2 w-full bg-brand-secondary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400 transition-colors"
                  >
                      Kirim Komentar
                  </button>
              </div>
          </div>
          
          <div className="flex justify-end items-center mt-6 space-x-3">
            {canManage && (
                <button onClick={() => onEdit(material)} className="px-6 py-2 bg-brand-secondary text-white rounded-md text-sm font-semibold">Edit Materi</button>
            )}
            <button onClick={onClose} className="px-6 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
};


const formatK = (num: number = 0) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return num;
};

const formatKReviews = (num: number = 0) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}k+`;
    }
    return num;
};

const LearningMaterialCard: React.FC<{
  material: LearningMaterial;
  onClick: () => void;
  onToggleFavorite: (materialId: string) => void;
}> = ({ material, onClick, onToggleFavorite }) => {
    const imageSrc = material.thumbnailUrl || 'https://placehold.co/400x200?text=Materi';
    
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(material.id);
    };

    return (
        <div 
            onClick={onClick} 
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
        >
            <div className="relative">
                <img src={imageSrc} alt={material.title} className="w-full h-32 object-cover" />
                <button 
                    onClick={handleFavoriteClick} 
                    className="absolute top-2 right-2 p-1.5 bg-white/70 backdrop-blur-sm rounded-full text-gray-700 hover:text-yellow-500 hover:bg-white transition-colors"
                    aria-label="Toggle favorite"
                >
                    {material.isFavorite ? (
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                    ) : (
                        <OutlineStarIcon className="w-6 h-6" />
                    )}
                </button>
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{material.targetClass || 'Semua'}</span>
                    <span className="border border-gray-300 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-md">Materi</span>
                </div>
                <h3 className="font-bold text-base text-brand-primary mb-1 line-clamp-2">{material.title}</h3>
                <p className="text-xs text-gray-500 mb-3 flex-grow">Budaya Luwu</p>
                
                <div className="border-t border-gray-200 pt-2 mt-auto flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center space-x-1.5" title={`${material.views} siswa telah melihat`}>
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        <span>{formatK(material.views)} Siswa</span>
                    </span>
                    <span className="flex items-center space-x-1.5" title={`${material.durationJP} Jam Pelajaran`}>
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{material.durationJP} JP</span>
                    </span>
                    <span className="flex items-center space-x-1.5" title={`${material.rating} dari ${material.reviews} ulasan`}>
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>{material.rating} ({formatKReviews(material.reviews)})</span>
                    </span>
                </div>
            </div>
        </div>
    );
};


export default function LuwuScreen({ 
  user, 
  onBack,
  materials,
  setAllMaterials,
  assessments,
  setAllAssessments,
  studentScores,
  setAllStudentScores,
  onToggleFavorite,
}: LuwuScreenProps) {
  const [activeTab, setActiveTab] = useState('materi');
  
  // Filtered data for the current school
  const schoolMaterials = useMemo(() => materials.filter(m => m.schoolId === user.schoolId), [materials, user.schoolId]);
  const schoolAssessments = useMemo(() => assessments.filter(a => a.schoolId === user.schoolId), [assessments, user.schoolId]);
  const schoolStudentScores = useMemo(() => studentScores.filter(s => s.schoolId === user.schoolId), [studentScores, user.schoolId]);
  
  const [isMaterialEditorOpen, setIsMaterialEditorOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<LearningMaterial | null>(null);
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [viewingMaterial, setViewingMaterial] = useState<LearningMaterial | null>(null);
  const [viewingPPT, setViewingPPT] = useState<(LearningMaterial['powerpoint']) | null>(null);
  const [takingAssessment, setTakingAssessment] = useState<Assessment | null>(null);
  
  const canManage = user.type === UserType.Guru || user.type === UserType.Admin;
  

  const handleSaveMaterial = (savedData: Omit<LearningMaterial, 'id' | 'schoolId'> & { id?: string }) => {
    if (savedData.id) {
        setAllMaterials(prev => prev.map(m => m.id === savedData.id ? { ...m, ...savedData, schoolId: user.schoolId } as LearningMaterial : m));
    } else {
        const newMaterial: LearningMaterial = {
            id: `m${materials.length + 1}-${Date.now()}`,
            ...savedData,
            schoolId: user.schoolId,
            views: 0,
            rating: 0,
            reviews: 0,
        } as LearningMaterial;
        setAllMaterials(prev => [newMaterial, ...prev]);

        // Log global event for notification system
        const newMaterialEvent = {
            type: 'NEW_MATERIAL_TANA_TORAJA', // Note: Using one event type for now. Could be specified per course.
            payload: { title: savedData.title },
            timestamp: new Date().toISOString(),
        };
        try {
            const existingEvents = JSON.parse(localStorage.getItem('globalAppEvents') || '[]');
            localStorage.setItem('globalAppEvents', JSON.stringify([...existingEvents, newMaterialEvent]));
        } catch (e) {
            console.error("Failed to save global event to localStorage", e);
        }
    }
    setIsMaterialEditorOpen(false);
    setMaterialToEdit(null);
  };
  
  const handleSubmitAssessment = (submission: StudentScore) => {
    setAllStudentScores(prev => [...prev, submission]);
    setTakingAssessment(null);
  };

  const handleEditClick = (material: LearningMaterial) => {
    setViewingMaterial(null);
    setMaterialToEdit(material);
    setIsMaterialEditorOpen(true);
  };
  
  const handleViewPPT = (ppt: { name: string; url: string; }) => {
    setViewingMaterial(null); // Close the detail modal
    setViewingPPT(ppt);       // Open the PPT viewer
  };

  const handleAddClick = () => {
    setMaterialToEdit(null);
    setIsMaterialEditorOpen(true);
  };

  const handleAddComment = (materialId: string, content: string) => {
    if (!content.trim()) return;

    const newComment: Comment = {
        id: `c${Date.now()}`,
        author: user.name,
        content: content.trim(),
        userType: user.type,
        timestamp: new Date(),
    };

    let updatedMaterial: LearningMaterial | null = null;

    const updatedMaterials = materials.map(m => {
        if (m.id === materialId) {
            updatedMaterial = {
                ...m,
                comments: [...(m.comments || []), newComment].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()),
            };
            return updatedMaterial;
        }
        return m;
    });

    setAllMaterials(updatedMaterials);
    if (updatedMaterial) {
        setViewingMaterial(updatedMaterial); // Refresh the modal view
    }
  };

  const handleDeleteComment = (materialId: string, commentId: string) => {
      let updatedMaterial: LearningMaterial | null = null;
      const updatedMaterials = materials.map(m => {
          if (m.id === materialId) {
              updatedMaterial = {
                  ...m,
                  comments: (m.comments || []).filter(c => c.id !== commentId),
              };
              return updatedMaterial;
          }
          return m;
      });
      setAllMaterials(updatedMaterials);
       if (updatedMaterial) {
          setViewingMaterial(updatedMaterial); // Refresh the modal view
      }
  };


  const filteredMaterials = schoolMaterials.filter(material => {
      if (classFilter === 'Semua Kelas') return true;
      return material.targetClass === 'Semua Kelas' || material.targetClass === classFilter;
  });

  const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 pb-2 font-semibold text-center transition-colors ${
          isActive ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-brand-secondary'
        }`}
      >
        {label}
      </button>
    );
  };
  
  const AddAssessmentModal: React.FC<{onClose: () => void}> = ({onClose}) => {
      const [title, setTitle] = useState('');
      const [type, setType] = useState<AssessmentType>(AssessmentType.UlanganHarian);
      const [questions, setQuestions] = useState<Question[]>([]);
      
      const handleAddQuestion = (type: QuestionType) => {
          if (type === QuestionType.PilihanGanda) {
              setQuestions([...questions, {id: `q${questions.length+1}`, type: QuestionType.PilihanGanda, question: '', options: ['', '', ''], correctAnswerIndex: 0}]);
          } else {
              setQuestions([...questions, {id: `q${questions.length+1}`, type: QuestionType.Essay, question: ''}]);
          }
      }
      
      const handleSave = () => {
          const newAssessment: Assessment = {
              id: `a${Date.now()}`,
              schoolId: user.schoolId,
              title,
              type,
              questions
          };
          setAllAssessments(prev => [...prev, newAssessment]);
          alert(`Assessment "${title}" berhasil dibuat!`);
          onClose();
      }

      return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-brand-primary mb-4">Tambah Assessment Baru</h3>
                      <div className="space-y-4">
                           <input type="text" placeholder="Judul Assessment" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
                           <select value={type} onChange={e => setType(e.target.value as AssessmentType)} className="w-full px-3 py-2 border rounded-md bg-white">
                               {Object.values(AssessmentType).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                           
                           <div className="border-t pt-4">
                               <h4 className="font-semibold mb-2">Pertanyaan</h4>
                               <div className="space-y-3">
                                   {questions.map((q, index) => (
                                       <div key={q.id} className="p-3 border rounded-md bg-gray-50">
                                           <p className="font-medium text-sm mb-2">Pertanyaan {index+1} ({q.type})</p>
                                           <textarea placeholder="Tulis pertanyaan disini..." className="w-full p-2 border rounded-md text-sm"></textarea>
                                           {q.type === QuestionType.PilihanGanda && (
                                                <div className="mt-2 space-y-1">
                                                   <input type="text" placeholder="Opsi A" className="w-full p-1 border rounded-md text-sm"/>
                                                   <input type="text" placeholder="Opsi B" className="w-full p-1 border rounded-md text-sm"/>
                                                   <input type="text" placeholder="Opsi C" className="w-full p-1 border rounded-md text-sm"/>
                                                </div>
                                           )}
                                       </div>
                                   ))}
                               </div>
                               <div className="flex space-x-2 mt-4">
                                   <button onClick={() => handleAddQuestion(QuestionType.PilihanGanda)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200">+ Pilihan Ganda</button>
                                   <button onClick={() => handleAddQuestion(QuestionType.Essay)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200">+ Essay</button>
                               </div>
                           </div>
                           
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                          <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Simpan</button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  const [isAddingAssessment, setIsAddingAssessment] = useState(false);

  const availableClasses = ['Semua Kelas', 'Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B'];
  
  const handleViewMaterial = (materialToView: LearningMaterial) => {
    // Increment view and review count only for students
    if (user.type === UserType.Siswa) {
        setAllMaterials(prevMaterials => 
            prevMaterials.map(material => 
                material.id === materialToView.id 
                    ? { ...material, views: (material.views || 0) + 1, reviews: (material.reviews || 0) + 1 } 
                    : material
            )
        );
    }
    setViewingMaterial(materialToView);
  };
  
  if (viewingPPT) {
    return <PPTViewer powerpoint={viewingPPT} onClose={() => setViewingPPT(null)} />;
  }

  if (takingAssessment && user.type === UserType.Siswa) {
      return <AssessmentTaker 
          assessment={takingAssessment} 
          user={user}
          onSubmit={handleSubmitAssessment} 
          onClose={() => setTakingAssessment(null)}
      />
  }

  return (
    <div className="space-y-4">
      <Header subtitle="Kab. Luwu" user={user} notifications={[]} setNotifications={() => {}}>
        <button onClick={onBack} className="text-brand-primary p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </Header>
      
      <div className="px-4">
        <div className="flex border-b">
          <TabButton tabName="materi" label="Materi Ajar" />
          <TabButton tabName="assessment" label="Assessment" />
          {canManage && <TabButton tabName="rekap" label="Rekap Nilai" />}
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'materi' && (
          <div className="space-y-4">
             {canManage && <button onClick={handleAddClick} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors mb-3">Tambah Materi Ajar</button>}
             
             <div className="flex items-center space-x-2">
                 <label htmlFor="classFilter" className="text-sm font-medium text-gray-700">Filter Kelas:</label>
                 <select 
                    id="classFilter"
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                    className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                 >
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMaterials.length > 0 ? filteredMaterials.map(material => (
                    <LearningMaterialCard 
                        key={material.id}
                        material={material}
                        onClick={() => handleViewMaterial(material)}
                        onToggleFavorite={onToggleFavorite}
                    />
                )) : (
                    <div className="md:col-span-3 sm:col-span-2 text-center py-8 text-gray-500">
                        <p>Tidak ada materi ajar yang sesuai dengan filter.</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-3">
            {canManage && <button onClick={() => setIsAddingAssessment(true)} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Tambah Assessment</button>}
            
            {schoolAssessments.map(assessment => {
                const submission = schoolStudentScores.find(s => s.assessmentId === assessment.id && s.studentName === user.name);
                return (
                  <div key={assessment.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-brand-primary">{assessment.title}</h3>
                      <p className="text-xs text-white bg-brand-primary px-2 py-0.5 rounded-full inline-block mt-1">{assessment.type}</p>
                    </div>
                    {user.type === UserType.Siswa ? 
                        submission ? (
                            <div className="text-right">
                                <p className="font-semibold text-brand-primary">Nilai: {submission.score}</p>
                                <button className="text-sm text-brand-secondary hover:underline">Lihat Hasil</button>
                            </div>
                        ) : (
                            <button onClick={() => setTakingAssessment(assessment)} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold">Kerjakan</button>
                        )
                    :
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold">Lihat</button>
                    }
                  </div>
                )
            })}
          </div>
        )}

        {activeTab === 'rekap' && canManage && (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-brand-primary mb-3">Rekap Nilai Siswa</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2">Nama Siswa</th>
                                <th className="p-2">Assessment</th>
                                <th className="p-2">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schoolStudentScores.map((score, index) => {
                                const assessmentTitle = schoolAssessments.find(a => a.id === score.assessmentId)?.title || 'Assessment Tidak Ditemukan';
                                return (
                                <tr key={index} className="border-b">
                                    <td className="p-2 font-medium">{score.studentName}</td>
                                    <td className="p-2 text-gray-600">{assessmentTitle}</td>
                                    <td className="p-2 font-bold text-brand-primary">{score.score}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
      
      {isMaterialEditorOpen && <MaterialEditorModal initialData={materialToEdit} onClose={() => { setIsMaterialEditorOpen(false); setMaterialToEdit(null); }} onSave={handleSaveMaterial} />}
      {isAddingAssessment && <AddAssessmentModal onClose={() => setIsAddingAssessment(false)} />}
      {viewingMaterial && <MaterialDetailModal user={user} material={viewingMaterial} onClose={() => setViewingMaterial(null)} onEdit={handleEditClick} onViewPPT={handleViewPPT} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />}
    </div>
  );
}