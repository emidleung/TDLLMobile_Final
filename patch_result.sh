#!/bin/bash
sed -i '' -e 's/const \[aiReport, setAiReport\] = useState.*//' src/components/ResultUploadPage.tsx
sed -i '' -e 's/const report = await onSubmitAICheck(base64);//' src/components/ResultUploadPage.tsx
sed -i '' -e '/if (report) {/,/}/d' src/components/ResultUploadPage.tsx
sed -i '' -e '/setAiReport(null);/d' src/components/ResultUploadPage.tsx
sed -i '' -e 's/const report = await onSubmitAICheck(presetUrl);//' src/components/ResultUploadPage.tsx
sed -i '' -e '/{aiReport && (/,/)}/d' src/components/ResultUploadPage.tsx
