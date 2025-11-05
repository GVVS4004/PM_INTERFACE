import { useRef, useState, useEffect, type ChangeEvent } from 'react';
import { Box, TextField, Button, Stack, Chip, IconButton, Card, CardMedia, CardActions, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import DeleteIcon from '@mui/icons-material/Delete';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface ImageItem {
  id: string;
  base64: string;
  name: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, disabled }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textContent, setTextContent] = useState('');

  // Separate text content from images on initial load
  useEffect(() => {
    const imgRegex = /<img[^>]+>/g;
    const foundImages: ImageItem[] = [];
    let cleanText = value;

    // Extract existing images from value
    const matches = value.match(imgRegex);
    if (matches) {
      matches.forEach((imgTag, index) => {
        const srcMatch = imgTag.match(/src="([^"]+)"/);
        const altMatch = imgTag.match(/alt="([^"]+)"/);
        const idMatch = imgTag.match(/id="([^"]+)"/);

        if (srcMatch && srcMatch[1].startsWith('data:image')) {
          const imageId = idMatch ? idMatch[1] : `img-existing-${index}`;
          foundImages.push({
            id: imageId,
            base64: srcMatch[1],
            name: altMatch ? altMatch[1] : `Image ${index + 1}`
          });
        }
      });

      // Remove img tags from text
      cleanText = value.replace(imgRegex, '').trim();
    }

    setImages(foundImages);
    setTextContent(cleanText);
  }, []); // Only run once on mount

  // Update parent when text or images change
  useEffect(() => {
    const imagesHtml = images.map(img =>
      `<img src="${img.base64}" alt="${img.name}" id="${img.id}" style="max-width: 100%; height: auto;" />`
    ).join('\n');

    const fullContent = textContent + (imagesHtml ? '\n' + imagesHtml : '');
    onChange(fullContent);
  }, [textContent, images]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const imageId = `img-${Date.now()}`;

      // Add to images array for preview
      const newImage: ImageItem = {
        id: imageId,
        base64: base64,
        name: file.name
      };
      setImages(prev => [...prev, newImage]);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const insertFormatting = (tag: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textContent.substring(start, end);

    let formattedText = '';
    if (tag === 'b') {
      formattedText = `<strong>${selectedText || 'bold text'}</strong>`;
    } else if (tag === 'i') {
      formattedText = `<em>${selectedText || 'italic text'}</em>`;
    } else if (tag === 'h1') {
      formattedText = `<h1>${selectedText || 'Heading 1'}</h1>`;
    } else if (tag === 'h2') {
      formattedText = `<h2>${selectedText || 'Heading 2'}</h2>`;
    } else if (tag === 'ul') {
      formattedText = `<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>`;
    }

    const newValue = textContent.substring(0, start) + formattedText + textContent.substring(end);
    setTextContent(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, flexWrap: 'wrap' }}>
        <IconButton
          size="small"
          onClick={() => insertFormatting('b')}
          disabled={disabled}
          title="Bold"
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => insertFormatting('i')}
          disabled={disabled}
          title="Italic"
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          startIcon={<ImageIcon />}
          onClick={handleImageUpload}
          disabled={disabled}
          variant="outlined"
        >
          Add Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Stack>

      <TextField
        name="content"
        multiline
        rows={12}
        fullWidth
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder={placeholder || 'Start typing... You can use HTML tags like <strong>, <em>, <h1>, <ul>, etc.'}
        disabled={disabled}
        sx={{
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
            fontSize: '14px',
          },
        }}
      />

      {images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Images ({images.length}):
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            {images.map((image) => (
              <Card key={image.id} sx={{ width: 150 }}>
                <CardMedia
                  component="img"
                  height="100"
                  image={image.base64}
                  alt={image.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                  <Typography variant="caption" noWrap sx={{ flex: 1, overflow: 'hidden' }}>
                    {image.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeImage(image.id)}
                    disabled={disabled}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <Chip
            label="Images are attached separately below"
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label="HTML tags supported: <strong>, <em>, <h1>, <h2>, <ul>, <li>, <p>"
            size="small"
            color="default"
            variant="outlined"
          />
        </Stack>
      </Box>
    </Box>
  );
};
