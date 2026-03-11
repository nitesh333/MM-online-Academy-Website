
import { Notification, Article } from '../types';

export const handleShareNews = async (n: Notification) => {
  // Construct a clean share URL
  const shareUrl = `${window.location.origin}/news/${n.id}`;
  const shareText = `${n.title}\n\n${n.content.substring(0, 160)}...`;
  
  return handleNativeShare(n.title, shareText, shareUrl, n.attachmentUrl);
};

export const handleShareArticle = async (a: Article) => {
  const shareUrl = `${window.location.origin}/article/${a.id}`;
  const shareText = `${a.title}\n\n${a.content.substring(0, 160)}...`;
  
  return handleNativeShare(a.title, shareText, shareUrl, a.imageUrl);
};

const handleNativeShare = async (title: string, text: string, url: string, imageUrl?: string) => {
  // Check for native share support
  if (navigator.share) {
    try {
      const shareData: any = {
        title: title,
        text: text,
        url: url,
      };

      // Detect if we are on mobile to decide whether to attempt image sharing
      // Desktop browsers often support text/url sharing but fail or lose user gesture during image processing
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Attempt to add image only on mobile and if imageUrl exists
      if (isMobile && imageUrl) {
        try {
          let file: File | null = null;
          
          if (imageUrl.startsWith('data:')) {
            const parts = imageUrl.split(',');
            const mime = parts[0].match(/:(.*?);/)?.[1];
            if (mime) {
              const bstr = atob(parts[1]);
              let n_len = bstr.length;
              const u8arr = new Uint8Array(n_len);
              while (n_len--) {
                u8arr[n_len] = bstr.charCodeAt(n_len);
              }
              file = new File([u8arr], 'share-image.png', { type: mime });
            }
          } else {
            // Fetch the image from URL - we use a timeout to not lose user gesture
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch(imageUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            const blob = await response.blob();
            file = new File([blob], 'share-image.png', { type: blob.type });
          }

          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (e) {
          console.error("Image attachment failed or timed out, sharing text only", e);
        }
      }

      // Final check: some browsers require at least one of these
      if (!shareData.title && !shareData.text && !shareData.url) {
        throw new Error("No data to share");
      }

      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error("Native share failed, falling back to clipboard", err);
    }
  }

  // Fallback: Clipboard copy
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard. You can now paste it to share.");
  } catch (e) {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Link copied to clipboard.");
    } catch (err) {
      alert("Share link: " + url);
    }
    document.body.removeChild(textArea);
  }
};
