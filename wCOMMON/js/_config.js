var USERNAME = 'felix';
var GAME = 'ttt'; // catan | aristocracy | ttt | game01
var PLAYMODE = 'hotseat'; // multiplayer | hotseat | solo | passplay
var SEED = 1;

const TESTING = true; // true | false //uses files from tests, DOES NOT send routes to server, instead: server stub
const RUNTEST = false; // true | false //just runTest preprocess serverData, pageHeaderInit, and clear

//*** TESTING *** uses files in /tests/GAME/uspecN and codeN, NO caching of uspec, code, and data!
const TEST_VERSION = '17'; // | null to use genauere
const DSPEC_PATH = '/wCOMMON/defaultSpec'
const DSPEC_VERSION = 4;
const CODE_VERSION = null;

//*** additional *** TESTING *** settings */
const USPEC_VERSION = '00';
const SERVERDATA_VERSION = 2; ///nur ttt!!!!!!!!!!!
const TEST_PATH = '/work/';
const USE_NON_TESTING_DATA = false; //uses spec,code from /games instead of /zdata

const INCREMENTAL_UPDATE = true; // diff is run after preProcessing serverData!
const USE_LOCAL_STORAGE = true; // true | false //localStorage is cleared when false!!!!!
const USE_MAX_PLAYER_NUM = false; // true | false

const TIMIT_SHOW = false; // true | false
const VERBOSE = true; // true | false
const SHOW_SERVER_ROUTE = false; // true | false
const SHOW_SERVER_RETURN = false; // true | false
const SHOW_CODE = false; // true | false
const SHOW_SERVERDATA = true; // true | false
const SHOW_SPEC = true; // true | false

//ONLY used when *** NOT testing: ***
var VERSION = '_02'; //files sollen heissen [GAME]_01.yaml and [GAME]_01.js, und im richtigen dir sein!!
var CACHE_DEFAULTSPEC = false;
var CACHE_USERSPEC = false;
var CACHE_CODE = false;
const CACHE_INITDATA = false;
const USE_ALL_GAMES_ROUTE = false; // true | false //false means directly loading game infos from info.yaml


// important vars
var SPEC = null; //merged userSpec and defaultSpec
var GAMEPLID = null; //game player id
var PGAMEPLID = null; //prev game player id

// performance *** TIMER ***
var timit;
var t_total = 0;
var t_avg = 0;

//settings that might change but unlikely:
//const INIT_CLEAR_LOCALSTORAGE = false; // true | false >>see above USE_LOCAL_STORAGE
const USER_SERVERDATA_STUB = false; // if true, need to jsCopy serverData to simulate new batch!
const USE_OLD_GRID_FUNCTIONS = false;// true | false
const STARTING_TAB_OPEN = 'bPlayers'; // bObjects | bPlayers | bSettings
//var OPEN_TAB = 'Seattle'; //S.settings.openTab = S_openTab; deprecated!

//mostly no need to change
var autoplayFunction = () => false;
var AIThinkingTime = 30;

var CLICK_TO_SELECT = true; //S.settings.clickToSelect = true;
var USE_SETTINGS = true; //S.settings.userSettings = S_userSettings;
var USE_STRUCTURES = true; //S.settings.userStructures = S_userStructures;
var USE_BEHAVIORS = true; //S.settings.userBehaviors = S_userBehaviors;

const USE_SOCKETIO = false;
const USE_BACKEND_AI = true;
const IS_MIRROR = false;
const FLASK = true;
const PORT = '5000';
const NGROK = null;// 'http://ee91c9fa.ngrok.io/'; // null;//'http://f3629de0.ngrok.io/'; //null; //'http://b29082d5.ngrok.io/' //null; //'http://2d97cdbd.ngrok.io/';// MUSS / am ende!!! 

//achtung!!! NO / at end!!!!!!!
const SERVER = IS_MIRROR ? 'http://localhost:5555' : FLASK ? (NGROK ? NGROK : 'http://localhost:' + PORT) : 'http://localhost:5005';
const PLAYER_CONFIG_FOR_MULTIPLAYER = ['me', 'human', 'human'];
const USERNAME_ORIG = USERNAME;



