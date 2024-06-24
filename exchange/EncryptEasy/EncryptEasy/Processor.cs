    using System.IO;
    using System.Security.Cryptography;
namespace EncryptEasy {
public class Processor
{
    /// <summary>
    /// This method is used to encrypt the source file using Triple DES algorithm and save the encrypted file to the destination path.
    /// </summary>
    /// <param name="filepath"></param>
    /// <param name="password"></param>
    /// <returns></returns>
    public static void Encrypt(string sourcePath, string destinationPath, string password)
    {
        // Read the contents of the source file
        byte[] fileBytes = File.ReadAllBytes(sourcePath);

        // Encrypt the file bytes using Triple DES algorithm
        byte[] encryptedBytes = EncryptBytes(fileBytes, password);

        // Write the encrypted bytes to the destination file
        File.WriteAllBytes(destinationPath, encryptedBytes);
    }



    private static byte[] EncryptBytes(byte[] inputBytes, string password)
    {
        using (TripleDES des = TripleDES.Create())
        {
            // Set the encryption key and mode
            des.Key = GenerateKey(password);
            des.Mode = CipherMode.ECB;
            des.Padding = PaddingMode.PKCS7;

            // Create an encryptor to perform the encryption
            ICryptoTransform encryptor = des.CreateEncryptor();

            // Encrypt the input bytes
            byte[] encryptedBytes = encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);

            // Return the encrypted bytes
            return encryptedBytes;
        }
    }

    private static byte[] GenerateKey(string password)
    {
        // Create a password-based key derivation function
        using (PasswordDeriveBytes pdb = new PasswordDeriveBytes(password, null))
        {
            // Generate a 192-bit key
            byte[] keyBytes = pdb.GetBytes(24);

            // Return the key bytes
            return keyBytes;
        }
    }
    private static byte[] DecryptBytes(byte[] inputBytes, string password)
    {
        using (TripleDES des = TripleDES.Create())
        {
            // Set the decryption key and mode
            des.Key = GenerateKey(password);
            des.Mode = CipherMode.ECB;
            des.Padding = PaddingMode.PKCS7;

            // Create a decryptor to perform the decryption
            ICryptoTransform decryptor = des.CreateDecryptor();

            // Decrypt the input bytes
            byte[] decryptedBytes = decryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);

            // Return the decrypted bytes
            return decryptedBytes;
        }
    }

/// <summary>
/// This method is used to decrypt the source file using Triple DES algorithm and save the decrypted file to the destination path.
/// </summary>
/// <param name="sourcePath"></param>
/// <param name="destinationPath"></param>
/// <param name="password"></param>
    public static void Decrypt(string sourcePath, string destinationPath, string password)
    {
           // Read the contents of the encrypted file
    byte[] encryptedBytes = File.ReadAllBytes(sourcePath);

    // Decrypt the file bytes using Triple DES algorithm
    byte[] decryptedBytes = DecryptBytes(encryptedBytes, password);


    // Write the decrypted bytes to the destination file
    File.WriteAllBytes(destinationPath, decryptedBytes); 
    }
}
}
