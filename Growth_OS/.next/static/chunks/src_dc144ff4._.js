(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/supabase.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "supabase": ()=>supabase
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://ehbfjhfwuulpagamhqpw.supabase.co") || 'https://placeholder.supabase.co';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYmZqaGZ3dXVscGFnYW1ocXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzM2MzgsImV4cCI6MjA3MDkwOTYzOH0.ZFPi0q8PZpUKHwbGRssGsy5qWOVzUSIFNcK2ZQfEKco") || 'placeholder-key';
const supabase = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey) : "TURBOPACK unreachable";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useAuth.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useAuthProvider": ()=>useAuthProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useAuthProvider() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuthProvider.useEffect": ()=>{
            console.log('AuthProvider useEffect - initializing...');
            // Get initial session
            if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
                console.log('Supabase available, getting session...');
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then({
                    "useAuthProvider.useEffect": (param)=>{
                        let { data: { session } } = param;
                        console.log('Initial session:', session);
                        var _session_user;
                        setUser((_session_user = session === null || session === void 0 ? void 0 : session.user) !== null && _session_user !== void 0 ? _session_user : null);
                        if (session === null || session === void 0 ? void 0 : session.user) {
                            console.log('User found, loading profile for:', session.user.id);
                            loadUserProfile(session.user.id);
                        } else {
                            console.log('No user session found');
                            setLoading(false);
                        }
                    }
                }["useAuthProvider.useEffect"]);
                // Listen for auth changes
                const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                    "useAuthProvider.useEffect": (event, session)=>{
                        console.log('Auth state changed:', event, session);
                        var _session_user;
                        setUser((_session_user = session === null || session === void 0 ? void 0 : session.user) !== null && _session_user !== void 0 ? _session_user : null);
                        if (session === null || session === void 0 ? void 0 : session.user) {
                            console.log('User authenticated, loading profile for:', session.user.id);
                            loadUserProfile(session.user.id);
                        } else {
                            console.log('User signed out, clearing profile');
                            setProfile(null);
                            setLoading(false);
                        }
                    }
                }["useAuthProvider.useEffect"]);
                return ({
                    "useAuthProvider.useEffect": ()=>subscription.unsubscribe()
                })["useAuthProvider.useEffect"];
            } else {
                console.log('Supabase not available');
                // Fallback for no Supabase config
                setLoading(false);
            }
        }
    }["useAuthProvider.useEffect"], []);
    const loadUserProfile = async (userId)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            console.log('No supabase client available for loading profile');
            return;
        }
        console.log('Loading user profile for ID:', userId);
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', userId).single();
            console.log('Profile query result:', {
                data,
                error
            });
            if (error) {
                console.error('Profile loading error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                if (error.code !== 'PGRST116') {
                    throw error;
                }
            }
            if (data) {
                console.log('Profile loaded successfully:', data);
                setProfile(convertToUserProfile(data));
            } else {
                console.log('No profile data found');
                setProfile(null);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally{
            console.log('Profile loading completed');
            setLoading(false);
        }
    };
    const signUp = async (email, password, username)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) throw new Error('Supabase configuration missing. Please check your environment variables.');
        console.log('Attempting to sign up user:', email);
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    bio: 'Hello! I\'m new to WorkWork.',
                    avatar: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
                }
            }
        });
        if (error) {
            console.error('Supabase auth error:', error);
            // 处理特定错误类型
            if (error.message.includes('User already registered')) {
                throw new Error('This email is already registered. Please try signing in instead.');
            } else if (error.message.includes('Invalid email')) {
                throw new Error('Please enter a valid email address.');
            } else if (error.message.includes('Password')) {
                throw new Error('Password must be at least 6 characters long.');
            } else {
                throw new Error("Registration failed: ".concat(error.message));
            }
        }
        if (data.user) {
            console.log('User created successfully. Profile will be auto-created by database trigger:', data.user.id);
        // Profile is now automatically created by database trigger
        // No need to wait in development mode
        }
    };
    const signIn = async (email, password)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) throw new Error('Supabase not configured');
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error('Supabase signin error:', error);
            // 处理特定错误类型
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Invalid email or password. Please check your credentials and try again.');
            } else if (error.message.includes('Email not confirmed')) {
                throw new Error('Please confirm your email address before signing in.');
            } else if (error.message.includes('Too many requests')) {
                throw new Error('Too many login attempts. Please try again later.');
            } else {
                throw new Error("Sign in failed: ".concat(error.message));
            }
        }
    };
    const signOut = async ()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) return;
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        if (error) throw error;
    };
    const connectWallet = async (walletAddress)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"] || !user) return;
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update({
            wallet_address: walletAddress
        }).eq('id', user.id);
        if (error) throw error;
        // Reload profile
        await loadUserProfile(user.id);
    };
    const updateProfile = async (updates)=>{
        var _updates_social, _updates_social1, _updates_social2, _updates_social3;
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"] || !user) return;
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update({
            username: updates.username,
            bio: updates.bio,
            avatar: updates.avatar,
            social_wechat: (_updates_social = updates.social) === null || _updates_social === void 0 ? void 0 : _updates_social.wechat,
            social_alipay: (_updates_social1 = updates.social) === null || _updates_social1 === void 0 ? void 0 : _updates_social1.alipay,
            social_linkedin: (_updates_social2 = updates.social) === null || _updates_social2 === void 0 ? void 0 : _updates_social2.linkedin,
            social_website: (_updates_social3 = updates.social) === null || _updates_social3 === void 0 ? void 0 : _updates_social3.website
        }).eq('id', user.id);
        if (error) throw error;
        // Reload profile
        await loadUserProfile(user.id);
    };
    return {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        connectWallet,
        updateProfile
    };
}
_s(useAuthProvider, "DYSpA4ZauWKW8e4CNkO4ayA+RbM=");
// Helper function to convert Supabase data to UserProfile
function convertToUserProfile(data) {
    var _this;
    return {
        id: data.id,
        email: data.email,
        walletAddress: data.wallet_address,
        username: data.username,
        bio: data.bio || '',
        avatar: data.avatar || 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
        social: {
            wechat: data.social_wechat,
            alipay: data.social_alipay,
            linkedin: data.social_linkedin,
            website: data.social_website,
            twitter: '',
            github: ''
        },
        stats: {
            totalSales: 0,
            totalProducts: 0,
            rating: 0,
            joinedAt: ((_this = data.created_at) === null || _this === void 0 ? void 0 : _this.split('T')[0]) || new Date().toISOString().split('T')[0]
        },
        verification: {
            isVerified: false,
            kycCompleted: false,
            badgeLevel: 'bronze',
            emailVerified: data.email_verified || false
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/providers/AuthProvider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": ()=>AuthProvider,
    "useAuth": ()=>useAuth
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useAuth() {
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function AuthProvider(param) {
    let { children } = param;
    _s1();
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthProvider"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: auth,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/providers/AuthProvider.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_s1(AuthProvider, "U5QEqN6sgp/9Kus+ung4cQwYnRk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthProvider"]
    ];
});
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_dc144ff4._.js.map