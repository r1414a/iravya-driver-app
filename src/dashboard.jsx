// DriverDashboard.jsx — Mobile-fixed version
// Key fixes:
//  1. Error boundary wrapping the whole app — no more white screens on crash
//  2. Mapbox token guard — shows clear error if env var missing
//  3. 100dvh instead of 100vh — accounts for mobile browser chrome (address bar)
//  4. Removed duplicate installPrompt state/effect
//  5. Fixed stale closure bug in interval (stops ref)
//  6. Fixed 's' variable shadowing in stops.map()
//  7. Map container gets explicit height via inline style — critical for mobile
//  8. All overflow issues that clip content on mobile fixed
//  9. Panel uses inline style for maxHeight so it works across all mobile browsers
// 10. Duplicate style prop on panel div removed

import { useEffect, useRef, useState, Component } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { error: null } }
    static getDerivedStateFromError(error) { return { error } }
    render() {
        if (this.state.error) {
            return (
                <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#f8fafc", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🚛</div>
                    <h2 style={{ color: "#701a40", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, maxWidth: 300 }}>{this.state.error?.message || "Unknown error"}</p>
                    <button onClick={() => window.location.reload()} style={{ background: "#701a40", color: "white", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        Reload App
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

// ── Token guard ───────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN
}

function NoTokenScreen() {
    return (
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#f8fafc", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <h2 style={{ color: "#701a40", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Mapbox Token Missing</h2>
            <p style={{ color: "#64748b", fontSize: 14, maxWidth: 320 }}>
                Add <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>VITE_MAPBOX_TOKEN</code> to your <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>.env</code> file and restart the dev server.
            </p>
        </div>
    )
}

// ── Strings ───────────────────────────────────────────────────────────────────
const STRINGS = {
    en: {
        title: "Fleet Driver", subtitle: "Driver Dashboard",
        phone_label: "Enter your registered phone number", phone_ph: "+91 98XXX XXXXX",
        send_otp: "Send OTP", otp_label: "Enter OTP sent to your phone",
        otp_hint: "Demo: enter any 6 digits", verify: "Verify & Start Trip",
        verifying: "Verifying…", wrong_otp: "Invalid OTP. Try any 6-digit number for demo.",
        confirm_stop: "Confirm delivery", confirmed: "Confirmed ✓",
        navigate: "Navigate", near_store: "You're near the store — confirm delivery",
        emergency: "EMERGENCY", emergency_q: "Confirm emergency alert?",
        emergency_hint: "This will alert your DC operator immediately.",
        emergency_yes: "Yes, send alert", emergency_cancel: "Cancel",
        emergency_sent: "Alert sent! DC operator notified.", call_dc: "Call DC",
        your_location: "Your location", gps_loading: "Getting GPS…", gps_error: "Location unavailable",
        route_loading: "Loading road route…", trip_progress: "Trip progress",
        logout: "End trip", logout_q: "End this trip? Your session will close.",
        logout_yes: "End trip", logout_cancel: "Continue",
        tab_stats: "Trip", tab_stops: "Stops", tab_alerts: "Alerts",
        speed: "Speed", eta: "ETA", distance: "Remaining",
        next_stop: "Next stop", all_done: "All deliveries complete!",
        no_alerts: "No alerts — all clear",
        km_h: "km/h", km: "km", pending: "Pending", completed: "Done",
    },
    mr: {
        title: "फ्लीट ड्रायव्हर", subtitle: "ड्रायव्हर डॅशबोर्ड",
        phone_label: "नोंदणीकृत फोन नंबर टाका", phone_ph: "+91 98XXX XXXXX",
        send_otp: "OTP पाठवा", otp_label: "फोनवर आलेला OTP टाका",
        otp_hint: "डेमो: कोणतेही 6 अंक टाका", verify: "पडताळा व ट्रिप सुरू करा",
        verifying: "पडताळत आहे…", wrong_otp: "चुकीचा OTP.",
        confirm_stop: "डिलिव्हरी पुष्टी करा", confirmed: "पुष्टी झाली ✓",
        navigate: "नेव्हिगेट करा", near_store: "तुम्ही स्टोअरजवळ आहात — पुष्टी करा",
        emergency: "आपत्कालीन", emergency_q: "आपत्कालीन अलर्ट पाठवायचा?",
        emergency_hint: "DC ऑपरेटरला ताबडतोब सूचना मिळेल.",
        emergency_yes: "होय, अलर्ट पाठवा", emergency_cancel: "रद्द करा",
        emergency_sent: "अलर्ट पाठवला!", call_dc: "DC ला कॉल करा",
        your_location: "तुमचे स्थान", gps_loading: "GPS मिळवत आहे…", gps_error: "स्थान उपलब्ध नाही",
        route_loading: "मार्ग लोड होत आहे…", trip_progress: "ट्रिप प्रगती",
        logout: "ट्रिप संपवा", logout_q: "ही ट्रिप संपवायची?",
        logout_yes: "संपवा", logout_cancel: "सुरू ठेवा",
        tab_stats: "ट्रिप", tab_stops: "थांबे", tab_alerts: "अलर्ट",
        speed: "वेग", eta: "ETA", distance: "उर्वरित",
        next_stop: "पुढचा थांबा", all_done: "सर्व डिलिव्हरी पूर्ण!",
        no_alerts: "सर्व ठीक आहे",
        km_h: "km/h", km: "km", pending: "प्रलंबित", completed: "पूर्ण",
    },
    hi: {
        title: "फ्लीट ड्राइवर", subtitle: "ड्राइवर डैशबोर्ड",
        phone_label: "पंजीकृत फ़ोन नंबर दर्ज करें", phone_ph: "+91 98XXX XXXXX",
        send_otp: "OTP भेजें", otp_label: "OTP दर्ज करें",
        otp_hint: "डेमो: कोई भी 6 अंक", verify: "सत्यापित करें और यात्रा शुरू करें",
        verifying: "सत्यापित हो रहा है…", wrong_otp: "गलत OTP।",
        confirm_stop: "डिलीवरी पुष्टि करें", confirmed: "पुष्टि हो गई ✓",
        navigate: "नेविगेट करें", near_store: "आप स्टोर के पास हैं — पुष्टि करें",
        emergency: "आपातकाल", emergency_q: "आपातकालीन अलर्ट भेजें?",
        emergency_hint: "DC ऑपरेटर को तुरंत सूचित किया जाएगा।",
        emergency_yes: "हाँ, अलर्ट भेजें", emergency_cancel: "रद्द करें",
        emergency_sent: "अलर्ट भेजा गया!", call_dc: "DC को कॉल करें",
        your_location: "आपका स्थान", gps_loading: "GPS प्राप्त हो रहा है…", gps_error: "स्थान अनुपलब्ध",
        route_loading: "मार्ग लोड हो रहा है…", trip_progress: "यात्रा प्रगति",
        logout: "यात्रा समाप्त करें", logout_q: "यात्रा समाप्त करें?",
        logout_yes: "समाप्त करें", logout_cancel: "जारी रखें",
        tab_stats: "यात्रा", tab_stops: "स्टॉप", tab_alerts: "अलर्ट",
        speed: "गति", eta: "ETA", distance: "शेष",
        next_stop: "अगला पड़ाव", all_done: "सभी डिलीवरी पूर्ण!",
        no_alerts: "सब ठीक है",
        km_h: "km/h", km: "km", pending: "प्रतीक्षारत", completed: "पूर्ण",
    },
}

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_TRIP = {
    id: "TRP-2841", truck: "MH12AB1234", driver: "Ramesh Kumar",
    sourceDC: "Pune Warehouse DC", dcPhone: "+912027421234",
    departedAt: "09:30 AM", etaFinal: "11:45 AM", totalDistance: 28,
    waypoints: [[18.6298, 73.7997], [18.5362, 73.8995], [18.5590, 73.7873]],
    stops: [
        { id: 1, name: "Koregaon Park Store", address: "Phoenix Market City, Nagar Rd", lat: 18.5362, lng: 73.8995, status: "pending", milestonePct: 52 },
        { id: 2, name: "Baner Store", address: "Balewadi High St, Baner", lat: 18.5590, lng: 73.7873, status: "pending", milestonePct: 82 },
    ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchRoute(waypoints) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";")
    const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`
    )
    const data = await res.json()
    if (!data.routes?.length) throw new Error("No route")
    return data.routes[0].geometry.coordinates
}

function distM(lat1, lng1, lat2, lng2) {
    const R = 6371000, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function interpolate(points, fraction) {
    if (!points?.length) return null
    if (fraction <= 0) return points[0]
    if (fraction >= 1) return points[points.length - 1]
    let total = 0
    const segs = []
    for (let i = 1; i < points.length; i++) {
        const [lng1, lat1] = points[i - 1], [lng2, lat2] = points[i]
        const d = distM(lat1, lng1, lat2, lng2)
        segs.push(d); total += d
    }
    let target = total * fraction
    for (let i = 0; i < segs.length; i++) {
        if (target <= segs[i]) {
            const t = target / segs[i]
            return [points[i][0] + t * (points[i + 1][0] - points[i][0]), points[i][1] + t * (points[i + 1][1] - points[i][1])]
        }
        target -= segs[i]
    }
    return points[points.length - 1]
}

function splitRouteByFraction(points, fraction) {
    if (!points?.length) return { done: [], rest: [] }
    if (fraction <= 0) return { done: [points[0]], rest: points }
    if (fraction >= 1) return { done: points, rest: [points[points.length - 1]] }
    let total = 0
    const segs = []
    for (let i = 1; i < points.length; i++) {
        const [lng1, lat1] = points[i - 1], [lng2, lat2] = points[i]
        const d = distM(lat1, lng1, lat2, lng2)
        segs.push(d); total += d
    }
    let target = total * fraction
    for (let i = 0; i < segs.length; i++) {
        if (target <= segs[i]) {
            const t = target / segs[i]
            const exactPos = [points[i][0] + t * (points[i + 1][0] - points[i][0]), points[i][1] + t * (points[i + 1][1] - points[i][1])]
            return { done: [...points.slice(0, i + 1), exactPos], rest: [exactPos, ...points.slice(i + 1)] }
        }
        target -= segs[i]
    }
    return { done: points, rest: [points[points.length - 1]] }
}

const ALERT_STYLE = {
    high: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", icon: "🚨" },
    medium: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", icon: "⚠️" },
    info: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", icon: "ℹ️" },
}

// ── DriverMap ─────────────────────────────────────────────────────────────────
function DriverMap({ routePoints, fraction, userLocation, stops }) {
    const ref = useRef(null)
    const mapRef = useRef(null)
    const truckRef = useRef(null)
    const userRef = useRef(null)
    const fittedRef = useRef(false)
    const dcMarkerRef = useRef(null)
    const stopMarkersRef = useRef([])

    useEffect(() => {
        if (mapRef.current || !ref.current) return
        try {
            mapRef.current = new mapboxgl.Map({
                container: ref.current,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [73.85, 18.56],
                zoom: 11,
                touchZoomRotate: true,
                dragRotate: false,
            })
            mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right")
        } catch (e) {
            console.error("Mapbox init failed:", e)
        }
    }, [])

    useEffect(() => {
        const map = mapRef.current
        if (!map || !routePoints?.length) return

        function ups(srcId, layId, coords, color, w, dash) {
            const gj = { type: "Feature", geometry: { type: "LineString", coordinates: coords } }
            if (map.getSource(srcId)) { map.getSource(srcId).setData(gj); return }
            map.addSource(srcId, { type: "geojson", data: gj })
            map.addLayer({
                id: layId, type: "line", source: srcId,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": color, "line-width": w, "line-opacity": 0.9, ...(dash ? { "line-dasharray": [4, 3] } : {}) }
            })
        }

        const render = () => {
            const { done, rest } = splitRouteByFraction(routePoints, fraction)
            ups("src-base", "lyr-base", routePoints, "#e2e8f0", 5, false)
            ups("src-done", "lyr-done", done, "#16a34a", 5, false)
            ups("src-rest", "lyr-rest", rest, "#2563eb", 4, true)

            if (!dcMarkerRef.current) {
                const sp = routePoints[0]
                const dcEl = document.createElement("div")
                dcEl.innerHTML = `<div style="background:#1e40af;width:38px;height:38px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:17px">🏭</div>`
                dcMarkerRef.current = new mapboxgl.Marker({ element: dcEl, anchor: "center" })
                    .setLngLat(sp)
                    .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>📦 ${DEMO_TRIP.sourceDC}</strong>`))
                    .addTo(map)
            }

            stopMarkersRef.current.forEach(m => m.remove())
            stopMarkersRef.current = []

            DEMO_TRIP.stops.forEach((stop, i) => {
                const el = document.createElement("div")
                // FIX: renamed callback param to avoid shadowing outer 's' translation object
                const doneStop = stops.find(sp => sp.id === stop.id)?.status === "completed"
                el.innerHTML = `<div style="background:${doneStop ? "#16a34a" : "#15803d"};width:38px;height:38px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:17px">${doneStop ? "✅" : "🏪"}</div>`
                const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
                    .setLngLat([stop.lng, stop.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>Stop ${i + 1}: ${stop.name}</strong><br><span style="font-size:12px;color:#64748b">${stop.address}</span>`))
                    .addTo(map)
                stopMarkersRef.current.push(marker)
            })

            if (!fittedRef.current) {
                const bounds = new mapboxgl.LngLatBounds()
                routePoints.forEach(pt => bounds.extend(pt))
                map.fitBounds(bounds, { padding: 60, duration: 1200 })
                fittedRef.current = true
            }
        }

        if (map.isStyleLoaded()) render()
        else map.once("style.load", render)
    }, [routePoints, stops, fraction])

    useEffect(() => {
        const map = mapRef.current
        if (!map || !routePoints?.length) return
        const { done, rest } = splitRouteByFraction(routePoints, fraction)
        const gj = (coords) => ({ type: "Feature", geometry: { type: "LineString", coordinates: coords } })
        if (map.getSource("src-done")) map.getSource("src-done").setData(gj(done))
        if (map.getSource("src-rest")) map.getSource("src-rest").setData(gj(rest))
    }, [fraction, routePoints])

    useEffect(() => {
        const map = mapRef.current
        if (!map || !routePoints?.length) return
        const pos = interpolate(routePoints, fraction)
        if (!pos) return
        if (!truckRef.current) {
            const el = document.createElement("div")
            el.innerHTML = `<div style="background:#701a40;width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 3px 14px rgba(112,26,64,.5);display:flex;align-items:center;justify-content:center;font-size:20px">🚛</div>`
            truckRef.current = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat(pos).addTo(map)
        } else {
            truckRef.current.setLngLat(pos)
        }
    }, [fraction, routePoints])

    useEffect(() => {
        const map = mapRef.current
        if (!map || !userLocation) return
        const { lat, lng } = userLocation
        if (!userRef.current) {
            const el = document.createElement("div")
            el.innerHTML = `<div style="background:#0ea5e9;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(14,165,233,.5)"></div>`
            userRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup().setHTML("<b>Your location</b>"))
                .addTo(map)
        } else {
            userRef.current.setLngLat([lng, lat])
        }
    }, [userLocation])

    // FIX: inline style height — Mapbox REQUIRES a pixel height on the container,
    // not just flex sizing. Without this it renders as 0px on mobile = white screen.
    return <div ref={ref} style={{ width: "100%", height: "100%", minHeight: "300px" }} />
}

// ── Main component ────────────────────────────────────────────────────────────
function DriverDashboardInner() {
    const [lang, setLang] = useState("en")
    const [screen, setScreen] = useState("otp")
    const [phone, setPhone] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [stops, setStops] = useState(DEMO_TRIP.stops)
    const [fraction, setFraction] = useState(0.15)
    const [routePoints, setRoutePoints] = useState([])
    const [routeLoading, setRouteLoading] = useState(false)
    const [userLocation, setUserLocation] = useState(null)
    const [gpsStatus, setGpsStatus] = useState("idle")
    const [showEmergency, setShowEmergency] = useState(false)
    const [emergencySent, setEmergencySent] = useState(false)
    const [showLogout, setShowLogout] = useState(false)
    const [activeTab, setActiveTab] = useState("stats")
    const [driverAlerts, setDriverAlerts] = useState([])
    const [simSpeed, setSimSpeed] = useState(62)
    const [nearStopId, setNearStopId] = useState(null)
    const [installPrompt, setInstallPrompt] = useState(null)

    // FIX: ref to avoid stale closure in setInterval
    const stopsRef = useRef(stops)
    useEffect(() => { stopsRef.current = stops }, [stops])

    const intervalRef = useRef(null)
    const gpsWatchRef = useRef(null)
    const alertIdRef = useRef(100)
    const s = STRINGS[lang]

    // FIX: single installPrompt handler with cleanup
    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const installApp = async () => {
        if (!installPrompt) return
        installPrompt.prompt()
        await installPrompt.userChoice
        setInstallPrompt(null)
    }

    const pushAlert = (type, severity, message) => {
        alertIdRef.current++
        setDriverAlerts(prev => [{
            id: alertIdRef.current, type, severity, message,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), unread: true
        }, ...prev].slice(0, 10))
    }
    const unreadCount = driverAlerts.filter(a => a.unread).length

    useEffect(() => {
        if (screen !== "dashboard") return
        setRouteLoading(true)
        fetchRoute(DEMO_TRIP.waypoints).then(pts => {
            setRoutePoints(pts)
            setFraction(0.15)
            let f = 0.15
            intervalRef.current = setInterval(() => {
                f = Math.min(f + 0.0006, 0.92)
                setFraction(f)
                setSimSpeed(55 + Math.floor(Math.random() * 30))
                const pos = interpolate(pts, f)
                if (pos) {
                    const currentStops = stopsRef.current  // FIX: use ref, not stale closure
                    const pendingStops = currentStops.filter(st => st.status === "pending")
                    if (pendingStops.length) {
                        let nearest = null, nearestDist = Infinity
                        for (const st of pendingStops) {
                            const d = distM(pos[1], pos[0], st.lat, st.lng)
                            if (d < nearestDist) { nearestDist = d; nearest = st }
                        }
                        setNearStopId(nearest && nearestDist < 500 ? nearest.id : null)
                    } else {
                        setNearStopId(null)
                    }
                }
            }, 1200)
        }).catch(err => {
            console.error("Route fetch failed:", err)
            pushAlert("route", "medium", "Could not load map route. Check your connection.")
        }).finally(() => setRouteLoading(false))
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [screen])

    useEffect(() => {
        if (screen !== "dashboard") return
        setGpsStatus("loading")
        if (!navigator.geolocation) { setGpsStatus("error"); return }
        gpsWatchRef.current = navigator.geolocation.watchPosition(
            pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus("ok") },
            () => setGpsStatus("error"),
            { enableHighAccuracy: true, maximumAge: 10000 }
        )
        return () => { if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current) }
    }, [screen])

    useEffect(() => {
        if (screen !== "dashboard") return
        const t1 = setTimeout(() => pushAlert("speeding", "high", "Speed 94 km/h — limit is 80 km/h. Slow down."), 12000)
        const t2 = setTimeout(() => pushAlert("geofence", "info", "Approaching Koregaon Park Store — 400m ahead."), 30000)
        const t3 = setTimeout(() => pushAlert("speeding", "high", "Speed 88 km/h — reduce speed immediately."), 55000)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [screen])

    const handleSendOtp = () => { if (!phone.trim()) return; setOtpSent(true); setOtpError(false) }
    const handleVerify = () => {
        setVerifying(true); setOtpError(false)
        setTimeout(() => { if (/^\d{6}$/.test(otp.trim())) setScreen("dashboard"); else setOtpError(true); setVerifying(false) }, 1200)
    }
    const confirmStop = (stopId) => {
        setStops(prev => prev.map(st => st.id === stopId ? { ...st, status: "completed" } : st))
        setNearStopId(null)
        const stopName = DEMO_TRIP.stops.find(st => st.id === stopId)?.name
        pushAlert("delivery", "info", `Delivery confirmed at ${stopName}.`)
    }
    const openNavigation = (lat, lng) => window.open(`https://maps.google.com/maps?daddr=${lat},${lng}`, "_blank")
    const handleEmergency = () => { setEmergencySent(true); setShowEmergency(false); pushAlert("emergency", "high", "Emergency alert sent to DC operator and admin.") }
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab === "alerts") setDriverAlerts(prev => prev.map(a => ({ ...a, unread: false })))
    }

    const completedCount = stops.filter(st => st.status === "completed").length
    const remainingPct = 1 - fraction
    const etaMins = Math.round(130 * remainingPct)
    const etaStr = etaMins > 60 ? `${Math.floor(etaMins / 60)}h ${etaMins % 60}m` : `${etaMins}m`
    const distRem = (DEMO_TRIP.totalDistance * remainingPct).toFixed(1)

    // ── OTP Screen ────────────────────────────────────────────────────────────
    if (screen === "otp") {
        return (
            <div style={{ minHeight: "100dvh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
                {installPrompt && (
                    <div style={{ marginBottom: 20, width: "100%", maxWidth: 380, background: "#701a40", color: "white", borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <p style={{ fontSize: 14, margin: 0 }}>Install Driver App for better tracking 🚛</p>
                        <button onClick={installApp} style={{ marginTop: 8, background: "white", color: "#701a40", border: "none", borderRadius: 8, padding: "6px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Install</button>
                    </div>
                )}
                <div className="flex gap-2 mb-8">
                    {[["en", "EN"], ["mr", "मराठी"], ["hi", "हिंदी"]].map(([code, label]) => (
                        <button key={code} onClick={() => setLang(code)}
                            style={lang === code ? { background: "#701a40", color: "white", border: "none" } : {}}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${lang === code ? "" : "bg-white border border-slate-200 text-slate-600"}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-8 text-center" style={{ background: "#701a40" }}>
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 text-3xl">🚛</div>
                        <h1 className="text-2xl font-bold text-white">{s.title}</h1>
                        <p className="text-white/70 text-sm mt-1">{s.subtitle}</p>
                    </div>
                    <div className="p-6">
                        {!otpSent ? (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{s.phone_label}</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSendOtp()} placeholder={s.phone_ph}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 outline-none text-sm bg-slate-50" />
                                </div>
                                <button onClick={handleSendOtp} disabled={!phone.trim()}
                                    style={{ background: phone.trim() ? "#701a40" : "#cbd5e1" }}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed">
                                    {s.send_otp}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{s.otp_label}</label>
                                    <input type="number" value={otp} onChange={e => { setOtp(e.target.value); setOtpError(false) }}
                                        onKeyDown={e => e.key === "Enter" && handleVerify()}
                                        placeholder="000000" maxLength={6}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none text-sm bg-slate-50 text-center text-2xl tracking-widest font-mono ${otpError ? "border-red-400" : "border-slate-200 focus:border-sky-400"}`} />
                                    <p className="text-xs text-slate-400 mt-1.5 text-center">{s.otp_hint}</p>
                                    {otpError && <p className="text-xs text-red-600 mt-1.5 text-center">{s.wrong_otp}</p>}
                                </div>
                                <button onClick={handleVerify} disabled={otp.length < 6 || verifying}
                                    style={{ background: otp.length >= 6 && !verifying ? "#701a40" : "#cbd5e1" }}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white">
                                    {verifying
                                        ? <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>{s.verifying}
                                        </span>
                                        : s.verify}
                                </button>
                                <button onClick={() => { setOtpSent(false); setOtp(""); setOtpError(false) }}
                                    className="text-sm text-slate-500 hover:text-slate-700">← {s.phone_label}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    // FIX: 100dvh = real mobile viewport (excludes browser chrome/address bar)
    //      flex column + overflow hidden = no scrolling, fills screen exactly
    return (
        <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Top bar */}
            <div style={{ background: "#701a40", flexShrink: 0 }} className="text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">🚛</div>
                    <div>
                        <p className="font-bold text-sm leading-tight">{DEMO_TRIP.driver}</p>
                        <p className="text-white/70 text-xs font-mono">{DEMO_TRIP.id} · {DEMO_TRIP.truck}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[["en", "EN"], ["mr", "म"], ["hi", "हि"]].map(([code, label]) => (
                            <button key={code} onClick={() => setLang(code)}
                                style={lang === code ? { background: "white", color: "#701a40" } : {}}
                                className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${lang === code ? "" : "bg-white/20 text-white"}`}>{label}</button>
                        ))}
                    </div>
                    <button onClick={() => setShowLogout(true)} className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10">{s.logout}</button>
                </div>
            </div>

            {installPrompt && (
                    <div style={{ marginBottom: 20, width: "100%", maxWidth: 380, background: "#701a40", color: "white", borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <p style={{ fontSize: 14, margin: 0 }}>Install Driver App for better tracking 🚛</p>
                        <button onClick={installApp} style={{ marginTop: 8, background: "white", color: "#701a40", border: "none", borderRadius: 8, padding: "6px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Install</button>
                    </div>
                )}

            {/* Banners */}
            {emergencySent && (
                <div style={{ flexShrink: 0 }} className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between">
                    <p className="text-sm font-semibold">🚨 {s.emergency_sent}</p>
                    <a href={`tel:${DEMO_TRIP.dcPhone}`} className="text-xs bg-white text-red-700 font-bold px-3 py-1.5 rounded-full shrink-0">{s.call_dc}</a>
                </div>
            )}
            {nearStopId && stops.find(st => st.id === nearStopId)?.status === "pending" && (
                <div style={{ flexShrink: 0 }} className="bg-green-600 text-white px-4 py-2.5 flex items-center justify-between">
                    <p className="text-sm font-semibold">📍 {s.near_store}</p>
                    <button onClick={() => confirmStop(nearStopId)} className="text-xs bg-white text-green-700 font-bold px-3 py-1.5 rounded-full shrink-0 active:scale-95">
                        {s.confirm_stop}
                    </button>
                </div>
            )}

            {/* Body: panel + map
                FIX: flex:1 + minHeight:0 is THE critical pattern for flex children
                     that contain scrollable/absolute content on mobile.
                     Without minHeight:0, children can overflow their flex parent. */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

                {/* Panel — 45% of body on mobile, full height sidebar on desktop */}
                <div style={{ flexShrink: 0, maxHeight: "45%", display: "flex", flexDirection: "column", background: "white", borderBottom: "1px solid #e2e8f0" }}
                    className="lg:max-h-full lg:w-72 lg:border-b-0 lg:border-r">

                    {/* Progress */}
                    <div style={{ flexShrink: 0 }} className="px-4 pt-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.trip_progress}</p>
                            <p className="text-xs font-bold text-slate-700">{completedCount}/{stops.length} stops · {Math.round(fraction * 100)}%</p>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-visible">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${Math.round(fraction * 100)}%` }} />
                            {stops.map(stop => (
                                <div key={stop.id}
                                    className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white z-10 transition-all duration-500 ${stop.status === "completed" ? "bg-green-600" : "bg-slate-300"}`}
                                    style={{ left: `calc(${stop.milestonePct}% - 7px)` }}
                                    title={stop.name} />
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ flexShrink: 0 }} className="flex border-b border-slate-100">
                        {[{ id: "stats", label: s.tab_stats }, { id: "stops", label: s.tab_stops }, { id: "alerts", label: s.tab_alerts, badge: unreadCount }].map(tab => (
                            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                                style={activeTab === tab.id ? { borderBottom: "2px solid #701a40", color: "#701a40" } : {}}
                                className={`flex-1 py-2.5 text-xs font-semibold relative transition-colors ${activeTab === tab.id ? "" : "text-slate-500"}`}>
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="absolute top-1.5 right-[22%] w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab content — scrollable */}
                    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                        {activeTab === "stats" && (
                            <div className="px-4 py-3">
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {[
                                        { label: s.speed, value: simSpeed, unit: s.km_h, red: simSpeed > 80 },
                                        { label: s.eta, value: etaStr, unit: "" },
                                        { label: s.distance, value: distRem, unit: s.km },
                                    ].map(({ label, value, unit, red }) => (
                                        <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                                            <p className={`text-base font-bold tabular-nums ${red ? "text-red-600" : "text-slate-900"}`}>{value}</p>
                                            {unit && <p className="text-[10px] text-slate-400">{unit}</p>}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {[
                                        { label: "Trip ID", value: DEMO_TRIP.id },
                                        { label: "Truck", value: DEMO_TRIP.truck },
                                        { label: "From", value: DEMO_TRIP.sourceDC },
                                        { label: "Departed", value: DEMO_TRIP.departedAt },
                                        { label: "ETA final", value: DEMO_TRIP.etaFinal },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs last:border-0">
                                            <span className="text-slate-500">{label}</span>
                                            <span className="font-medium text-slate-800 font-mono">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "stops" && (
                            <div className="px-3 sm:px-4 py-3 flex flex-col gap-3">
                                {completedCount === stops.length ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-3">🎉</div>
                                        <p className="font-bold text-green-700 text-sm">{s.all_done}</p>
                                    </div>
                                ) : stops.map((stop, i) => {
                                    const isNear = nearStopId === stop.id && stop.status === "pending"
                                    return (
                                        <div key={stop.id} className={`rounded-xl border p-3 transition-all ${stop.status === "completed" ? "bg-green-50 border-green-200" : isNear ? "bg-blue-50 border-blue-400" : "bg-white border-slate-200"}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${stop.status === "completed" ? "bg-green-500 text-white" : isNear ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                                                        {stop.status === "completed" ? "✓" : i + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-slate-900 truncate">{stop.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{stop.address}</p>
                                                        {isNear && <p className="text-xs text-blue-600 font-medium mt-0.5">You're nearby — tap to confirm</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    {stop.status !== "completed" && (
                                                        <button onClick={() => openNavigation(stop.lat, stop.lng)}
                                                            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium">{s.navigate}</button>
                                                    )}
                                                    {stop.status === "completed"
                                                        ? <span className="text-xs px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium">{s.confirmed}</span>
                                                        : <button onClick={() => confirmStop(stop.id)}
                                                            style={{ background: isNear ? "#2563eb" : "#701a40" }}
                                                            className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium active:scale-95">
                                                            {s.confirm_stop}
                                                        </button>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {activeTab === "alerts" && (
                            <div className="px-3 sm:px-4 py-3">
                                {driverAlerts.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <div className="text-3xl mb-2">✅</div>
                                        <p className="text-sm">{s.no_alerts}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {driverAlerts.map(alert => {
                                            const st = ALERT_STYLE[alert.severity] || ALERT_STYLE.info
                                            return (
                                                <div key={alert.id} className={`rounded-xl border px-3 py-2.5 ${st.bg} ${st.border}`}>
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="text-base shrink-0 mt-0.5">{st.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className={`text-xs font-semibold uppercase tracking-wide ${st.text}`}>{alert.type}</p>
                                                                <span className={`text-[10px] ${st.text} opacity-70`}>{alert.time}</span>
                                                            </div>
                                                            <p className={`text-xs mt-0.5 leading-relaxed ${st.text}`}>{alert.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map — FIX: flex:1 + minHeight:0 fills all remaining space on mobile */}
                <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
                    {routeLoading ? (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f1f5f9", gap: 12 }}>
                            <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="#701a40" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <p className="text-sm text-slate-500">{s.route_loading}</p>
                        </div>
                    ) : (
                        <DriverMap routePoints={routePoints} fraction={fraction} userLocation={userLocation} stops={stops} />
                    )}

                    {/* GPS pill */}
                    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5 ${gpsStatus === "ok" ? "bg-green-100 text-green-700" : gpsStatus === "loading" ? "bg-blue-100 text-blue-600" : gpsStatus === "error" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`w-2 h-2 rounded-full ${gpsStatus === "ok" ? "bg-green-500" : gpsStatus === "loading" ? "bg-blue-400" : gpsStatus === "error" ? "bg-red-400" : "bg-slate-300"}`} />
                        {gpsStatus === "ok" ? s.your_location : gpsStatus === "loading" ? s.gps_loading : gpsStatus === "error" ? s.gps_error : "GPS"}
                    </div>

                    {/* Speed indicator */}
                    <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}
                        className="bg-white rounded-xl border border-slate-200 shadow-md px-3 py-1.5 flex items-center gap-2 min-w-[72px] justify-center">
                        <span className={`text-xl font-bold tabular-nums ${simSpeed > 80 ? "text-red-600" : "text-slate-800"}`}>{simSpeed}</span>
                        <div>
                            <p className="text-[10px] text-slate-400 leading-none">{s.km_h}</p>
                            {simSpeed > 80 && <p className="text-[9px] font-bold text-red-600 leading-none mt-0.5">FAST</p>}
                        </div>
                    </div>

                    {/* Map legend */}
                    <div style={{ position: "absolute", top: 52, left: 12, zIndex: 10 }}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2 text-xs space-y-1">
                        <div className="flex items-center gap-1.5"><span className="w-5 h-1.5 bg-green-600 rounded-full inline-block" />Covered</div>
                        <div className="flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 3" /></svg>Remaining</div>
                        <div className="flex items-center gap-1.5"><span className="text-sm">🏭</span>Warehouse</div>
                        <div className="flex items-center gap-1.5"><span className="text-sm">🏪</span>Store</div>
                        <div className="flex items-center gap-1.5"><span className="text-sm">🔵</span>You</div>
                    </div>

                    {/* Emergency button */}
                    <button onClick={() => setShowEmergency(true)}
                        style={{ position: "absolute", bottom: 16, left: 16, zIndex: 10, boxShadow: "0 0 0 4px rgba(220,38,38,0.25)" }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-2xl flex items-center gap-2 active:scale-95 transition-all">
                        <span>🚨</span> {s.emergency}
                    </button>
                </div>
            </div>

            {/* Emergency modal */}
            {showEmergency && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}
                    onClick={() => setShowEmergency(false)}>
                    <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-3xl">🚨</div>
                        <h2 className="text-xl font-bold text-center text-slate-900 mb-2">{s.emergency_q}</h2>
                        <p className="text-sm text-slate-500 text-center mb-6">{s.emergency_hint}</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleEmergency} className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm">{s.emergency_yes}</button>
                            <button onClick={() => setShowEmergency(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm">{s.emergency_cancel}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout modal */}
            {showLogout && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}
                    onClick={() => setShowLogout(false)}>
                    <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 mb-2 text-center">{s.logout}</h2>
                        <p className="text-sm text-slate-500 text-center mb-6">{s.logout_q}</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setScreen("otp"); setOtpSent(false); setOtp(""); setPhone(""); setShowLogout(false); setDriverAlerts([]) }}
                                style={{ background: "#701a40" }}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm">{s.logout_yes}</button>
                            <button onClick={() => setShowLogout(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm">{s.logout_cancel}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
    if (!MAPBOX_TOKEN) return <NoTokenScreen />
    return (
        <ErrorBoundary>
            <DriverDashboardInner />
        </ErrorBoundary>
    )
}