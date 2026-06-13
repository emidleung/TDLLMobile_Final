#!/bin/bash
sed -i '' "s/await updateDoc(doc(db, \\\"tasks\\\", taskId), { taskStatus: 'dish_approved' });/await updateDoc(doc(db, \\\"tasks\\\", taskId), { taskStatus: 'rated' });/g" /Users/emidiol/Downloads/hekki/src/App.tsx
