# 🤖 DoseWise: Real-Time AI Setup Guide

Follow this step-by-step guide to train and deploy your custom pill identification model for the **DoseWise** system.

---

## 📋 Prerequisites
1. A few samples of your **Morning Pill** (e.g., White round pill)
2. A few samples of your **Evening Pill** (e.g., Blue capsule)
3. A computer with a working webcam.
4. An internet connection.

---

## 🛠️ Step 1: Open Teachable Machine
Go to [teachablemachine.withgoogle.com](https://teachablemachine.withgoogle.com/) and click **Get Started**. Select **Image Project** and then **Standard Image Model**.

---

## 🏷️ Step 2: Define Your Classes (PS 45 Alignment)
To perfectly align with the challenge requirements and the App's logic, create exactly these **five** classes:

1.  **Class 1**: `pill_morning` (e.g., White Round Pill)
2.  **Class 2**: `pill_afternoon` (e.g., Red Capsule)
3.  **Class 3**: `pill_evening` (e.g., Blue Capsule)
4.  **Class 4**: `no_pill` (Empty hand/Background)
5.  **Class 5**: `multiple_pills` (Safety check)

> [!IMPORTANT]
> Use these exact lowercase names! The system uses these names to log your adherence automatically.



---

## 📸 Step 3: Record Training Data

### Class: `no_pill` (Important!)
- Click **Webcam**.
- Record about 300 samples of your empty hand or just the background where you will hold the pill.
- **Pro Tip**: Move your hand slightly so the AI learns what "empty" looks like in different positions.

### Class: `pill_morning`
- Hold your morning pill between your fingers in front of the camera.
- Record about 500 samples.
- **Pro Tip**: Rotate the pill and move it closer/further from the lens so the AI recognizes it from all angles.

### Class: `pill_evening`
- Repeat the process with your evening pill/capsule.
- Record about 500 sample
### Class: `multiple_pills`
- Hold two or more pills in your hand.
- Record about 200 samples.

---

## 🧠 Step 4: Train the Model
- Click **Train Model**.
- **Do not close the tab** while it's training. It usually takes 30-60 seconds.

---

## 📤 Step 5: Export & Get Your Link
1. Once training is done, click **Export Model**.
2. Stay on the **Tensorflow.js** tab.
3. Select **Upload (shareable link)**.
4. Click **Upload my model**.
5. After it uploads, copy the **Your shareable link** (it looks like: `https://teachablemachine.withgoogle.com/models/xxxxxx/`).

---

## 🛡️ Step 6: Connect to DoseWise
1. Open your **DoseWise** application (`index.html`).
2. Click the **⚙️ AI Settings** button in the header.
3. Paste the link you copied into the box.
4. Click **Save & Close**.
5. Click **▶️ Start Detection**.

---

## 💡 Troubleshooting Tips for Hackathons
- **Lighting**: Ensure you are in a well-lit area. Shadows can confuse the AI.
- **Focus**: Hold the pill about 4-6 inches (10-15 cm) from the camera.
- **Class Names**: If the app says "Not your medication" when you hold the correct pill, double-check that you named the classes *exactly* as shown in Step 2 (all lowercase, underscores).
- **Public URL**: Make sure your Teachable Machine link is fully uploaded and public.

---

**You're all set! Your DoseWise system is now powered by real AI.**
