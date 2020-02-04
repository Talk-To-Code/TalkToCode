package ASTTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

import org.junit.Test;

import ast.ASTNode;
import ast.ASTParser;

import junit.framework.TestCase;

public class DoWhileTest extends TestCase {
	private static ASTParser parser;
	@Test
	public void testDoWhile() {
		try {
			InputStream in = new FileInputStream(new File("./input/DoWhileInput.txt"));
			InputStream out = new FileInputStream(new File("./output/DoWhileOutput.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			//parser = new ASTParser(in);
			ASTParser.ReInit(in);
			String currentTemp = "";
			while((temp=br.readLine())!=null) {
				currentTemp = currentTemp.concat(temp);
				currentTemp = currentTemp.concat("\n");
			}
			
			int testNo = 0;
			while(testNo!=count){
				try {
					assertEquals(testNo+" "+expectedOutput.get(testNo),testNo+" "+parser.statement(new ASTNode(), ASTParser.programType.C, 0).toSyntax());
					testNo++;
				} catch (Exception ex){
					//ex.printStackTrace();
				}
			}
		} catch(IOException e){
			e.printStackTrace();
		}
	}
}
