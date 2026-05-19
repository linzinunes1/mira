import { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type AnalysisResult = Record<string, unknown>;

export default function MirrorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is needed for the makeup mirror.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function capture() {
    if (!cameraRef.current || analyzing) return;
    setError(null);
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        skipProcessing: true,
      });

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo?.base64 }),
      });

      const json = await response.json();
      setResult(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={"front" as CameraType}
      />

      <TouchableOpacity
        style={[styles.captureButton, analyzing && styles.captureButtonDisabled]}
        onPress={capture}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.captureButtonText}>Analyze</Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && !error && (
        <ScrollView style={styles.overlay} contentContainerStyle={styles.overlayContent}>
          <Text style={styles.overlayTitle}>AI Analysis</Text>
          <Text style={styles.overlayBody}>
            {JSON.stringify(result, null, 2)}
          </Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setResult(null)}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  permissionText: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: "#e91e8c",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  captureButton: {
    position: "absolute",
    bottom: 48,
    backgroundColor: "#e91e8c",
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: "#888",
  },
  captureButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  overlay: {
    position: "absolute",
    bottom: 140,
    left: 16,
    right: 16,
    maxHeight: "50%",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: 16,
  },
  overlayContent: {
    paddingBottom: 8,
  },
  overlayTitle: {
    color: "#e91e8c",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  overlayBody: {
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 11,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 13,
  },
  dismissButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dismissButtonText: {
    color: "#fff",
    fontSize: 13,
  },
});
