package ast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for creating the AST node for C programs
 */
public final class ASTCompilationUnitC extends ASTCompilationUnit {

	public ASTCompilationUnitC(String name) {
		super(name);
	}
	//This method outputs a C program with respective program name
	public void toFile(String path){
		this.toSyntax();
		String filename = path + this.name + ".c";
		File textOutput = new File(filename);
		try {
			String output = "";
			for (char c : this.result.toCharArray()){
				if(c == '\n') output += '\r';
				output += c;
			}
            textOutput.createNewFile();
            FileOutputStream fos = new FileOutputStream(
                    textOutput.getAbsolutePath());
            fos.write(output.getBytes());
            fos.flush();
            fos.close();
        } catch (IOException e) {

            e.printStackTrace();
        }
	}
}
