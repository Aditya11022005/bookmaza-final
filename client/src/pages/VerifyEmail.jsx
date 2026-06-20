import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ChevronRight, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Dummy email for masking
  const userEmail = "john***@example.com";

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    // Take only the last character if they pasted multiple
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      return toast.error("Please enter all 6 digits");
    }
    setIsLoading(true);
    
    // Dummy verification
    setTimeout(() => {
      setIsLoading(false);
      if (otpValue === '123456') {
        toast.success("Email verified successfully!");
        navigate('/');
      } else {
        toast.error("Invalid OTP. Try 123456.");
      }
    }, 1500);
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0].focus();
    toast.success("New OTP sent to your email!");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Elements */}
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary-200/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[20%] bg-primary-400/10 blur-[80px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(106,13,173,0.1)] border border-gray-100 p-8 sm:p-12 relative z-10"
      >
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
             <Mail size={32} strokeWidth={1.5} />
           </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-3">Verify Your Email</h2>
          <p className="text-[#64748b] font-inter">
            Enter the 6-digit verification code sent to <br/>
            <span className="font-bold text-[#1e293b]">{userEmail}</span>
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                inputMode="numeric"
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-center text-2xl font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm shadow-gray-100/50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="flex items-center gap-2 relative z-10">
              {isLoading ? 'Verifying...' : 'Verify Email'} 
              {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#64748b] font-medium text-[14px]">
            Didn't receive the code?{' '}
            {timer > 0 ? (
              <span className="text-gray-400 font-bold ml-1">Resend in {timer}s</span>
            ) : (
              <button 
                onClick={handleResend}
                className="font-bold text-primary-600 hover:text-primary-800 transition-colors hover:underline ml-1"
              >
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
