package ASTTest;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.channels.FileChannel;
import java.util.ArrayList;

import org.junit.Test;

import ast.ASTNode;
import ast.ASTParser;

import junit.framework.TestCase;

public class PointerTest extends TestCase {
	private static ASTParser parser;
	@Test
	public void testPointer() {
		try {
			InputStream in = new FileInputStream(new File("./input/PointerInput.txt"));
			InputStream out = new FileInputStream(new File("./output/PointerOutput.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			//parser = new ASTParser(in);
			ASTParser.ReInit(in);
			String currentTemp = "";
			for(int i = 0; i < 4; i++) {
				currentTemp = "";
				if ((temp = br.readLine()) != null) {
					currentTemp = currentTemp.concat(temp);
					currentTemp = currentTemp.concat("\n");
					expectedOutput.add(currentTemp);
					count++;
				}
			}
			for(int j = 0; j < 2; j++) {
				currentTemp = "";
				for(int i = 0; i < 2; i++) {
					if ((temp = br.readLine()) != null) currentTemp = currentTemp.concat(temp);
					currentTemp = currentTemp.concat("\n");
				}
				expectedOutput.add(currentTemp);
				count++;
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
