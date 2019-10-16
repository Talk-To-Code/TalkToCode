package ast;

/**
 * @author GAO RISHENG
 * This class is the combination of all statements that can be presented within 1 lines
 * e.g return/continue/break/label/expression/create variable/goto etc
 */
public class ASTSimpleStatement extends ASTStatement{
	private static final String NODE_TYPE = "Simple Statement";
	public ASTSimpleStatement(){
		super();
	}
	public String toSyntax(){
		this.result = "\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
