

class Program {

    public static void Main(string[] args) {

    string action = args[0];
    string sourcePath = args[1];
    string destinationPath = args[2];
    string password = args[3];

    if (action == "-e") 
    EncryptEasy.Processor.Encrypt(sourcePath, destinationPath, password);
    else if (action == "-d")    
    EncryptEasy.Processor.Decrypt(sourcePath, destinationPath, password);
    }
}