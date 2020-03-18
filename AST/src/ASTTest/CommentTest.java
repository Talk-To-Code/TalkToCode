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

public class CommentTest extends TestCase {
	private static ASTParser parser;
	@Test
	public void testComment() {
		try {
			InputStream in = new FileInputStream(new File("./input/CommentInput.txt"));
			InputStream out = new FileInputStream(new File("./output/CommentOutput.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			//parser = new ASTParser(in);
			ASTParser.ReInit(in);
			String currentTemp = "";
			for(int j = 0; j < 2; j++) {
				currentTemp = "";
				for(int i = 0; i < 2; i++) {
					if ((temp = br.readLine()) != null) currentTemp = currentTemp.concat(temp);
					if (i < 1) currentTemp = currentTemp.concat("\n");
				}
				expectedOutput.add(currentTemp);
				count++;
			}
			currentTemp = "";
			for(int j = 0; j < 8; j++) if ((temp = br.readLine()) != null) currentTemp = currentTemp.concat(temp + "\n");				
			count++;
			expectedOutput.add(currentTemp);
			for(int i = 0; i < 3; i++) {
				currentTemp = "";
				for(int j = 0; j < 6; j++) if ((temp = br.readLine()) != null) currentTemp = currentTemp.concat(temp + "\n");				
				count++;
				expectedOutput.add(currentTemp);
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
