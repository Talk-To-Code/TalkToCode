package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is the combination of all expressions in C,Java and Python
 *
 */
public class ASTExpression extends ASTNode {
	private static final String NODE_TYPE = "Expression";

	protected boolean isQuoted = false;
	
	public ASTExpression(){
		super();
	}
	
	/**
	 * @deprecated
	 * virtual methods
	 */
	public ASTExpression(String result,boolean isQuote){
		this(isQuote);
		this.result = result;

	}

	public ASTExpression(boolean isQuote){
		super();
		this.isQuoted = isQuote;
		this.result = "";
		
	}
	/**
	 * @deprecated constructor
	 */
	public ASTExpression(ASTExpression a){
		this.result = a.result;
		this.isQuoted = a.isQuoted;
	}
	public void setResult(String text){
		this.result = text;
	}
	public void setQuote(){
		this.isQuoted = true;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
	//virtual method
	public String toSyntax() {	
		return this.result;
	}
	protected void quote(){
		this.result = "("+this.result+")";
	}
}
