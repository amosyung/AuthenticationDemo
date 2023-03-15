using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace EncryptDemo
{
    static internal class CipherHelper
    {
        public static byte[] Encrypt3DES(string key, string iv, byte[] data)
        {
            /*byte[] key = new byte[24]; // 24 bytes = 192 bits (3 * 64 bits)
            byte[] iv2 = new byte[8]; // 8 bytes = 64 bits
            RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(key);
            rng.GetBytes(iv);*/

            // Create a 3DES object with the specified key and IV
            TripleDES tripleDES = TripleDES.Create();
            tripleDES.Key =Encoding.ASCII.GetBytes(key);
            tripleDES.IV = Encoding.ASCII.GetBytes(iv);

            // Encrypt the plaintext using 3DES
            byte[] ciphertext = tripleDES.CreateEncryptor().TransformFinalBlock(data, 0, data.Length);
            return ciphertext;
        }
    }
}
