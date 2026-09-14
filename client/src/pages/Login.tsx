import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ASCII_ART = `:-:.:.:.......:............................................................:-=-==+=*%#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
:::........................................... ..... ........ ..............:--==+**#%%%@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
:::............................................. ....................:.....:-====++##%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
..........................................................................:-=-===+##%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
......................................... ........   .. ..................::--==+####%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@
..:....................................... ....... .   ...  ..............::-=++=+**##%%%%%%%@@@@%@@@@@@@@@@@@@@@@@@@@@@
...........................................  .. .... . ..................::--=++**####%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@
..................................... ............................:.....::--==+=+#####%%%%%%%@%@@@@@@@@@@@@@@@@@@@@@@@@@
.........................:=++***#%%@@@@@@@@@@@@@%%%%%##**++++++=+++++++***+++****+*+***###%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@
....:...............:#@#**#*******++++++=---::::.................................. .    ........-#@@@@@@@@@@@@@@@@@@@@@@
...................#@@%*+*##########**+==-:::::.:................................. ...  ..... .  ..%@@@@@@@@@@@@@@@@@@@@
............. ....%@%=#%#+-:::...................................................... ......   . .-..%@@@@@@@@@@@@@@@@@@@
......... .......:%@=*@+:.-*###%%%%%%%%%%%%%%%%%%%@%%%@#-:::-*%%%%%%%%%%%%%%@%%%%%%%%%%#####-  ..:-.*@@@@@@@@@@@@@@@@@@@
.................-@@-%-=:%%%%%@%%%%%%%%%%%%%%%%%%%%%#:.........:#%%%%%%%%%%%@%%%%%%%%%%%%%%%%#..=.= +@@@@@@@@@@@@@@@@@@@
............:....-@@:%=+-%%%%%%%%%%%%%%%%%%%%%%###@-.......:.:..::%#%%%%%##%%#%%%%#%%%%%#%%%%%  :.= +@@@@@@@@@@@@@@@@@@@
.................=@@-%=++%%%@%@@%%@@%%%@%%%%@%%%##:::..........:.::#%%%@%%%%@%%%%%%%#%%%%%%%%%. ..- +@@@@@@@@@@@@@@@@@@@
.....  .. .......-@%-%-=#%%%%%%%%%%%%%%%%%%%%%###-................::##%%%%%%%##%%%%%#%%%%%%%#%: . :.=%@@@@@@@@@@@@@@@@@@
 ......... ..:::-=%%-%==%%%@%%%@%%%@%%%%%%%%%%%#@:.................:*#%%%%%%@%%%%%%%#%%%%%%%%%=.  :.:@@%@@@@@@@@@@@@@@@@
.......  ...:.:.:::---:-%%%%%%%%%%%%%%%%%%%%%%%##-..................+*#%%%%%%%%%%#%%#%%%#%%%%%+   :..%@@@@@@@@@@@@@@@@@@
........  ......:.:::----+#%%%%@%%%@%%%%%%%%%%%##+::...............:=*##%%%%%%%%%%%%#%%%#%%%#%+.  :..%%@@@@@%@@@@@@@@@@@
..............::::::::::---+%%%%%%%@%%%%%%%%%%%##+-:................:-%#%%%%%%%%%%%%%%%%%#####+.  : .@@@%%%@@@@@@@@@@@@@
............. ...::::::::::--=#%%%%%%%%%%%%%%%%##+:::...............:+###%#%%%%%%%%%#%%%##%###=   :..@%%@@%@%@@@@@@@@@@@
.  .. .. .......:=@+:.....:::----==**#%%%%%%%%%%##+:::.............:+**####%%#####%%%%###%%###=   ...%%%%%@%@@@@@@@@@@@@
.  .. ...........=@#:*-::.:::::::::-----=*#%%%%%%#%##-.............=#**##**#%*####%%%%%%*#%%##+    ..%%%@@@@@@@@@@@@@@@@
..... ...........=@#:*+:#-...:.....:.::-----=+#%%#%###:...........:%#**##**##**###%%#%%%**##**=.     %%%%%%@%@@@@@@@@@@%
 .  ....... ....:-+=-*+:%%%+........:-::-----:-==*%###=...........-@#**##**##*****###%%#++****=     .%%%@@@@@@%@%@@@@@@@
. ... ........:::::----=%%%%*---=-==-----------:---=+##:.........:=@#*###**##**#**##*##*+***+*=.    .%@%@@@@@@@@@@@@@@@@
 ..... ............::----=+--=------------------:---:----.........-****##**##+******+***=+++++=     .%%%%%%%%%@@@@@@@@@@
 ............:......::=-=---==-----:------------=-----:--===+-...:-#######*#%####*##**##++****=.  . .%%@@@%%@@@@%@@@@@@@
  ...... .. ...:::..:.::----------:.:--+++==+++-:-=------::::::--::--*#**++*#++****++***==++=+-.  . .%%@%%%%%%@@%@@@@@@@
..  ..   ... ....::......::::-::...=---:::--++=+++*+--=::.:::.:::=:..::::.:=*#########%#######=   . .%%%%%@%%@%@%%@%%@@@
   ..        ....-@+:::..........::.::::::::--=-----=-.:-::::.:::--.......:+-::=#***+***++++++-   . .%%%%%%%@%@%@@%%%%@@
..        .    ..:%%.+.:.:::=+**-:...::::.::::=-:::-::.:--:::::-:-++:...=-:......-**********++-   . .%%%%%%%%%%%%%%%%%@%
          .     ..%%:+.=-%%%%%%%#:..::::::::::=:.:-::::.:-:::::::++++---:.........****#*+***+*-.  . .%%%%@%@%%%%%%%%%%@@
.                .%%:=.-:%%%%#%%%*...:---:::::-.:::......:.::::--====-::.........-**+***+++*++:   :  %%%%%%@%@%@@%%@@@@@
                ..%%==.::%%%%#%%###:....::::::....:..:.::.::-:--+---:..:........=*#*****+***+*: . . .%%%%%%%%%%%%%%%%%%@
                 .%%+=:::######%##%%=.....::......::.::::::-::--:::::...........-+**+***++**++. :.. .%#%%%%%%%%%%%%%%%%@
                 .*%*-*..+#####%##%%*:::--::..:.:..:::::::::...:::::............:+**+***++**+-  = . .###%%%###%#%%%#%%%%
     .            -%*.*-....:--=-=+**+==+=-----::.::...::..:::.:......:::---::...::-::..   .  .:. : =##%####%###%##%%%%%
                   +#*:+#+=--::::........................... .......:......        .       .    .. .##%######%%#######%%
.                  .#+*####%%%%####***+++====--:.:.............   ...........     ....   .  .      .###################%
                   .%%%*+==---:::::::::---:::::::...................                               :####%#########%#%#%%
                   .%@@#******+*+++-+=====-+-=--=-=:=:::::::.:.:::.:....:....... . .......  .      .######*########*###%
                    %@@#******++=-+:=-==-*-+:+-===*-*:=--=:=:=:-::-.-.-.:.::.:.: : :.::.-.. ....   .########*####*######
                    %@@**++*++-=-:=.+--=-*-*-+=++=*:#:*-+=-+:+:=:--.=.+.=:-::=.-.-.-:-=:+::.... .  .**#*#**+****#**#*###
                    %@@*=----=:--.+.=+=+-*-*-*+++-*-#-#-==-*:#:+-==.+.*.=::-:=.*.=.---=.+::.. ...: .**#*++=********+**##
                   .%@*-:......    ..                   .                                          .+*#**+************##
       .    .......:%%#***+=--:::::::.............................. ...   ..                    .  :+****+=++***#+*++*##
 ............:--=-=%%%%#*:   ...:...........:.:.....::..............................  .....:=++.   .+################%##
::--=**##%#%%%%%%%@@@@@#:..:=+#%+:::--*%+:-:=%*:-.:+-:=:-:::--.-::... .+.:-.=:.=. . ...-.:.....:..  .##%%##%%%%%#%%%%%@@
@@@@@@@@@@@@@@@@@@@@@@@%%######%##%%%*#*****####***+++++++==+=--:--::.::............ ........       .-=+*+*####%%%%%%@@@
@@@@@@@@@@@@@@@@@@@@@@%#######*+***#*###************+++=+=+=-=::::::::..............   :              ........::++##%%%%
@@@@@@@@@@@@@@@@@@@@%%##%##%####################*#********++++===---:-:.:............... . .         ...........:-+*#%%%
@@@@@@@@@@@@@@@@@@@@%*#*#*+*******#***##***#****+++==++==+======-=====-===============+===++++++++++*##%%#%%%%%%%%%%%%%%
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
====------==-=====+++++++**++******##*#**######################%#*######%###*############%%%%%%%%%%%%%%%%%@%@@@@@@@@@@@@
............................................................... ................ .......................................
+++****+************++++***++**+++*+++++=+=====--------------::::::::::::::::................. ........................::
++++++=+#***###***+*++**++*+**#*****+*=++*#*+*#*+****++++*+*+*********+*********#***+*+*****#***#+****+*++***#+#####***++
+-==+++******=**##**+++**#++*+*+**+#*+=**#++++******#**++#**=*+++***#*++#*+*+**++**#**+*+#**++#+*+******++*#**+++**#*#*#*#
`;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!email.endsWith('@sece.ac.in')) {
      setError("Only @sece.ac.in emails are permitted.");
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-crypto-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] border-2 border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left: Branding & ASCII Showcase */}
        <div className="hidden md:flex flex-1 bg-crypto-purple relative overflow-hidden flex-col justify-between p-12 text-white border-r border-gray-100">
          <div className="relative z-10">
            <h2 className="font-heading font-extrabold text-4xl mb-2 text-white">Offclass</h2>
            <p className="font-display font-bold text-purple-200 text-lg max-w-sm leading-tight">
              The central hub for the cybersecurity department.
            </p>
          </div>
          
          {/* ASCII Art as a subtle cyberpunk background element */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-25 pointer-events-none overflow-hidden select-none transform scale-125 translate-x-12">
            <pre className="font-mono text-[5px] leading-[5px] font-bold text-white whitespace-pre text-center">
              {ASCII_ART}
            </pre>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 relative bg-white">
          <div className="max-w-sm w-full mx-auto">
            <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 group">
              <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Home
            </Link>
            
            <div className="mb-10 text-center md:text-left">
              <h1 className="font-heading font-extrabold text-3xl text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600 font-medium text-sm">Enter your SECE email to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-gray-900">College Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@sece.ac.in"
                  className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-sm outline-none transition-all ${
                    error ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-200 focus:border-black bg-gray-50 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-900">Password</label>
                  <a href="#" className="text-xs font-bold text-crypto-purple hover:text-purple-700 transition-colors">Forgot?</a>
                </div>
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-sm outline-none transition-all ${
                    error ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-200 focus:border-black bg-gray-50 text-gray-900'
                  }`}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center border-2 border-black"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm font-medium text-gray-600">
              Don't have an account? <a href="#" className="text-black font-bold hover:underline underline-offset-4">Sign Up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
