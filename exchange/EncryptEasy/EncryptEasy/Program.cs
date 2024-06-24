// See https://aka.ms/new-console-template for more information
Console.WriteLine("Hello, World!");
/*
string action = args[0];
string sourcePath = args[1];
string destinationPath = args[2];
string password = args[2];
*/
/*
string action = "-e";
string sourcePath = "C:\\Projects\\MPCE\\mpce.zip";
string destinationPath = "C:\\temp\\mpce_go\\mpce_zip";
string password = "demolition";
*/

string action = "-d";
string sourcePath = "C:\\temp\\mpce_go\\mpce_zip";
string destinationPath = "c:\\temp\\mpce_go\\mpce.zip";
string password = "demolition";

if (action == "-e") 
EncryptEasy.Processor.Encrypt(sourcePath, destinationPath, password);
else if (action == "-d")    
EncryptEasy.Processor.Decrypt(sourcePath, destinationPath, password);