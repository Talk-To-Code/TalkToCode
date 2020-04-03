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

public class ClassDeclarePyTest extends TestCase {
	private static ASTParser parser;
	@Test
	public void testClassDeclare() {
		try {
			InputStream in = new FileInputStream(new File("./input/ClassInput.txt"));
			InputStream out = new FileInputStream(new File("./output/ClassOutputPy.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			parser = new ASTParser(in);
			//ASTParser.ReInit(in);
			String currentTemp = "";
			if ((temp = br.readLine()) != null) currentTemp = currentTemp.concat(temp + "\n");
			while((temp=br.readLine())!=null){
				if(temp.length() >= 5 && temp.substring(0, 5).compareTo("class") == 0) {
					expectedOutput.add(currentTemp);
					currentTemp = "";
					count++;
				}
				currentTemp = currentTemp.concat(temp + "\n");
			}
			count++;
			expectedOutput.add(currentTemp);
			
			int testNo = 0;
			while(testNo!=count){
				try {
					assertEquals(testNo+" "+expectedOutput.get(testNo),testNo+" "+parser.statement(new ASTNode(), ASTParser.programType.P, 0).toSyntax());
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
