package ast;

import java.util.ArrayList;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of AST node construction of debug statements for displaying unparsed speech input
 */
public class ASTDebugStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Debug";
	private String str;
	
	public ASTDebugStatement() {
		super();
	}
	
	public ASTDebugStatement(String str) {
		this();
		this.str = str;
	}
	
	public String toSyntax(){
		this.result = str.substring(1, str.length()-1) + "\n";
		return this.result;
	}
	
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}

}
